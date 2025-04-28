import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType, IncomeStatementSection, IncomeStatementAccount } from '@qbit/shared-types';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncomeStatementGenerator {
  private readonly logger = new Logger(IncomeStatementGenerator.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(
    startDate: string,
    endDate: string,
    comparativePeriod?: any,
    includeZeroBalances = false
  ): Promise<any> {
    this?.logger.log(`Generating income statement for period: ${startDate} to ${endDate}`);

    // Get revenue and expense accounts
    const accounts = await this?.prisma.db?.account.findMany({
      where: {
        isActive: true,
        type: {
          in: [AccountType.REVENUE, AccountType.EXPENSE],
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Get account balances for the current period
    const accountBalances = await this.calculateAccountBalances(accounts, startDate, endDate);

    // Process comparative period if requested
    let comparativeBalances = {};
    let previousStartDate: string | undefined;
    let previousEndDate: string | undefined;
    
    if (comparativePeriod) {
      // Calculate previous period dates
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const diffInDays = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      const prevEndDateObj = new Date(startDateObj);
      prevEndDateObj.setDate(prevEndDateObj.getDate() - 1);
      
      const prevStartDateObj = new Date(prevEndDateObj);
      prevStartDateObj.setDate(prevStartDateObj.getDate() - diffInDays);
      
      previousStartDate = prevStartDateObj.toISOString().split('T')[0];
      previousEndDate = prevEndDateObj.toISOString().split('T')[0];
      
      comparativeBalances = await this.calculateAccountBalances(
        accounts, 
        previousStartDate,
        previousEndDate
      );
    }

    // Group accounts by type and subtype
    const revenue = this.groupAccountsBySubtype(
      accounts.filter(account => account.type === AccountType.REVENUE),
      accountBalances,
      comparativeBalances,
      includeZeroBalances
    );
    
    const expenses = this.groupAccountsBySubtype(
      accounts.filter(account => account.type === AccountType.EXPENSE),
      accountBalances,
      comparativeBalances,
      includeZeroBalances
    );

    // Calculate totals
    const totalRevenue = revenue.reduce((sum, section) => sum + section.total, 0);
    const totalExpenses = expenses.reduce((sum, section) => sum + section.total, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    // Calculate comparative data
    let previousNetIncome: number | undefined;
    let netIncomeChange: number | undefined;
    let netIncomeChangePercentage: number | undefined;
    
    if (comparativePeriod) {
      const prevTotalRevenue = revenue.reduce((sum, section) => sum + (section.previousTotal || 0), 0);
      const prevTotalExpenses = expenses.reduce((sum, section) => sum + (section.previousTotal || 0), 0);
      previousNetIncome = prevTotalRevenue - prevTotalExpenses;
      
      netIncomeChange = netIncome - previousNetIncome;
      netIncomeChangePercentage = previousNetIncome !== 0 
        ? (netIncomeChange / Math.abs(previousNetIncome)) * 100 
        : null;
    }

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      previousNetIncome,
      netIncomeChange,
      netIncomeChangePercentage,
    };
  }

  private async calculateAccountBalances(
    accounts: any[],
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    const accountIds = accounts.map(account => account.id);
    
    // Execute a raw SQL query to get account balances
    const result = await this?.prisma.$queryRaw<Array<{accountId: string, balance: Decimal}>>`
      SELECT 
        "accountId", 
        SUM(COALESCE("credit", 0) - COALESCE("debit", 0)) as balance
      FROM "journal_entry_lines" jel
      JOIN "journal_entries" je ON je.id = jel."journalEntryId"
      WHERE 
        jel."accountId" IN (${accountIds})
        AND je.date >= ${startDate}
        AND je.date <= ${endDate}
        AND je.status = 'POSTED'
      GROUP BY "accountId"
    `;
    
    // Convert to a map of accountId -> balance
    const balances: Record<string, number> = {};
    for (const row of result) {
      const account = accounts.find(a => a.id === row.accountId);
      if (account) {
        // For expense accounts, we flip the sign to show positive values
        // (debits increase expenses, credits increase revenue)
        const multiplier = account.type === AccountType.EXPENSE ? -1 : 1;
        balances[row.accountId] = Number(row.balance) * multiplier;
      }
    }
    
    return balances;
  }

  private groupAccountsBySubtype(
    accounts: any[],
    balances: Record<string, number>,
    comparativeBalances: Record<string, number>,
    includeZeroBalances: boolean
  ): IncomeStatementSection[] {
    // Group accounts by subtype
    const subtypeGroups: Record<string, any[]> = {};
    for (const account of accounts) {
      if (!subtypeGroups[account.subtype]) {
        subtypeGroups[account.subtype] = [];
      }
      subtypeGroups[account.subtype].push(account);
    }
    
    // Format into sections
    const sections: IncomeStatementSection[] = [];
    for (const [subtype, subtypeAccounts] of Object.entries(subtypeGroups)) {
      const formattedAccounts: IncomeStatementAccount[] = subtypeAccounts
        .map(account: any => {
          const amount = balances[account.id] || 0;
          const previousAmount = comparativeBalances[account.id] || 0;
          const change = amount - previousAmount;
          const changePercentage = previousAmount !== 0 
            ? (change / Math.abs(previousAmount)) * 100 
            : null;
            
          return {
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            amount,
            previousAmount: Object.keys(comparativeBalances).length ? previousAmount : undefined,
            change: Object.keys(comparativeBalances).length ? change : undefined,
            changePercentage: Object.keys(comparativeBalances).length ? changePercentage : undefined,
          };
        })
        // Filter out zero amounts if not including them
        .filter(account => includeZeroBalances || account.amount !== 0);
      
      if (formattedAccounts.length === 0) {
        continue; // Skip empty sections
      }
      
      const sectionTotal = formattedAccounts.reduce((sum, account) => sum + account.amount, 0);
      const previousTotal = Object.keys(comparativeBalances).length
        ? formattedAccounts.reduce((sum, account) => sum + (account.previousAmount || 0), 0)
        : undefined;
      
      const change = previousTotal !== undefined ? sectionTotal - previousTotal : undefined;
      const changePercentage = previousTotal !== undefined && previousTotal !== 0
        ? (change / Math.abs(previousTotal)) * 100
        : undefined;
      
      // Format subtype name for display
      const formattedSubtype = subtype
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
      
      sections.push({
        title: formattedSubtype,
        accounts: formattedAccounts,
        total: sectionTotal,
        previousTotal,
        change,
        changePercentage,
      });
    }
    
    return sections;
  }
} 