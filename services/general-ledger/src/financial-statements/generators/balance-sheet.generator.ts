import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType, BalanceSheetAccount, BalanceSheetSection } from '@qbit/shared-types';
import { Decimal } from '@prisma/client/runtime/library';
import { Account } from '@prisma/client';

@Injectable()
export class BalanceSheetGenerator {
  private readonly logger = new Logger(BalanceSheetGenerator.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(
    asOfDate: string,
    endDate: string,
    comparativePeriod: boolean = false,
    includeZeroBalances: boolean = false,
  ): Promise<{
    assets: BalanceSheetSection[];
    liabilities: BalanceSheetSection[];
    equity: BalanceSheetSection[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
  }> {
    this.logger.log(`Generating balance sheet as of ${asOfDate}`);

    // Fetch all accounts
    const accounts = await this.prisma.account.findMany({
      where: {
        isActive: true,
        type: {
          in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY],
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Get account balances
    const accountBalances = await this.calculateAccountBalances(accounts, endDate);

    // Process comparative period if requested
    let comparativeBalances = {};
    if (comparativePeriod) {
      // Calculate previous year's end date (same day last year)
      const previousYearEndDate = new Date(endDate);
      previousYearEndDate.setFullYear(previousYearEndDate.getFullYear() - 1);
      
      comparativeBalances = await this.calculateAccountBalances(
        accounts, 
        previousYearEndDate.toISOString().split('T')[0]
      );
    }

    // Group accounts by type and subtype
    const assets = this.groupAccountsBySubtype(
      accounts.filter(account => account.type === AccountType.ASSET),
      accountBalances,
      comparativeBalances,
      includeZeroBalances
    );
    
    const liabilities = this.groupAccountsBySubtype(
      accounts.filter(account => account.type === AccountType.LIABILITY),
      accountBalances,
      comparativeBalances,
      includeZeroBalances
    );
    
    const equity = this.groupAccountsBySubtype(
      accounts.filter(account => account.type === AccountType.EQUITY),
      accountBalances,
      comparativeBalances,
      includeZeroBalances
    );

    // Calculate totals
    const totalAssets = assets.reduce((sum, section) => sum + section.total, 0);
    const totalLiabilities = liabilities.reduce((sum, section) => sum + section.total, 0);
    const totalEquity = equity.reduce((sum, section) => sum + section.total, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
    };
  }

  private async calculateAccountBalances(
    accounts: Account[],
    asOfDate: string
  ): Promise<Record<string, number>> {
    const accountIds = accounts.map(account => account.id);
    
    // Execute a raw SQL query to get account balances
    const result = await this.prisma.$queryRaw<Array<{accountId: string, balance: Decimal}>>`
      SELECT 
        "accountId", 
        SUM(COALESCE("debit", 0) - COALESCE("credit", 0)) as balance
      FROM "journal_entry_lines" jel
      JOIN "journal_entries" je ON je.id = jel."journalEntryId"
      WHERE 
        jel."accountId" IN (${Prisma.join(accountIds)})
        AND je.date <= ${asOfDate}
        AND je.status = 'POSTED'
      GROUP BY "accountId"
    `;
    
    // Convert to a map of accountId -> balance
    const balances: Record<string, number> = {};
    for (const row of result) {
      const account = accounts.find(a => a.id === row.accountId);
      if (account) {
        // For liability and equity accounts, we flip the sign to show positive values
        // as credit balances are natural for these account types
        const multiplier = account.type === AccountType.ASSET ? 1 : -1;
        balances[row.accountId] = Number(row.balance) * multiplier;
      }
    }
    
    return balances;
  }

  private groupAccountsBySubtype(
    accounts: Account[],
    balances: Record<string, number>,
    comparativeBalances: Record<string, number>,
    includeZeroBalances: boolean
  ): BalanceSheetSection[] {
    // Group accounts by subtype
    const subtypeGroups: Record<string, Account[]> = {};
    for (const account of accounts) {
      if (!subtypeGroups[account.subtype]) {
        subtypeGroups[account.subtype] = [];
      }
      subtypeGroups[account.subtype].push(account);
    }
    
    // Format into sections
    const sections: BalanceSheetSection[] = [];
    for (const [subtype, subtypeAccounts] of Object.entries(subtypeGroups)) {
      const formattedAccounts: BalanceSheetAccount[] = subtypeAccounts
        .map(account => {
          const balance = balances[account.id] || 0;
          const previousBalance = comparativeBalances[account.id] || 0;
          const change = balance - previousBalance;
          const changePercentage = previousBalance !== 0 
            ? (change / Math.abs(previousBalance)) * 100 
            : null;
            
          return {
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            balance,
            previousBalance: Object.keys(comparativeBalances).length ? previousBalance : undefined,
            change: Object.keys(comparativeBalances).length ? change : undefined,
            changePercentage: Object.keys(comparativeBalances).length ? changePercentage : undefined,
          };
        })
        // Filter out zero balances if not including them
        .filter(account => includeZeroBalances || account.balance !== 0);
      
      if (formattedAccounts.length === 0) {
        continue; // Skip empty sections
      }
      
      const sectionTotal = formattedAccounts.reduce((sum, account) => sum + account.balance, 0);
      
      // Format subtype name for display
      const formattedSubtype = subtype
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
      
      sections.push({
        title: formattedSubtype,
        accounts: formattedAccounts,
        total: sectionTotal,
      });
    }
    
    return sections;
  }
} 