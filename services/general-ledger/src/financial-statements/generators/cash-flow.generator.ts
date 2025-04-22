import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType, CashFlowSection, CashFlowItem } from '@qbit/shared-types';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CashFlowGenerator {
  private readonly logger = new Logger(CashFlowGenerator.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(
    startDate: string,
    endDate: string,
    comparativePeriod: boolean = false,
  ): Promise<{
    operatingActivities: CashFlowSection[];
    investingActivities: CashFlowSection[];
    financingActivities: CashFlowSection[];
    netCashFromOperatingActivities: number;
    netCashFromInvestingActivities: number;
    netCashFromFinancingActivities: number;
    netChangeInCash: number;
    beginningCash: number;
    endingCash: number;
  }> {
    this.logger.log(`Generating cash flow statement from ${startDate} to ${endDate}`);

    // Get all cash accounts
    const cashAccounts = await this.prisma.account.findMany({
      where: {
        type: AccountType.ASSET,
        subtype: 'CASH',
        isActive: true,
      },
    });

    const cashAccountIds = cashAccounts.map(account => account.id);

    // Calculate beginning cash balance
    const beginningCash = await this.getCashBalance(cashAccountIds, startDate, false);

    // Calculate ending cash balance
    const endingCash = await this.getCashBalance(cashAccountIds, endDate, true);

    // Get all account activity for the period
    const accountActivity = await this.getAccountActivity(startDate, endDate);

    // Calculate net income for the period (revenue - expenses)
    const netIncome = this.calculateNetIncome(accountActivity);

    // Group transactions into operating, investing, and financing activities
    const operatingActivities = await this.getOperatingActivities(accountActivity, netIncome);
    const investingActivities = await this.getInvestingActivities(accountActivity);
    const financingActivities = await this.getFinancingActivities(accountActivity);

    // Calculate totals
    const netCashFromOperatingActivities = operatingActivities.reduce(
      (sum, section) => sum + section.total,
      0
    );
    
    const netCashFromInvestingActivities = investingActivities.reduce(
      (sum, section) => sum + section.total,
      0
    );
    
    const netCashFromFinancingActivities = financingActivities.reduce(
      (sum, section) => sum + section.total,
      0
    );

    const netChangeInCash = 
      netCashFromOperatingActivities + 
      netCashFromInvestingActivities + 
      netCashFromFinancingActivities;

    // Sanity check: netChangeInCash should equal endingCash - beginningCash
    const calculatedChange = endingCash - beginningCash;
    if (Math.abs(netChangeInCash - calculatedChange) > 0.01) {
      this.logger.warn(`Cash flow reconciliation issue: calculated change (${calculatedChange}) ` +
        `does not match sum of activities (${netChangeInCash})`);
    }

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFromOperatingActivities,
      netCashFromInvestingActivities,
      netCashFromFinancingActivities,
      netChangeInCash,
      beginningCash,
      endingCash,
    };
  }

  private async getCashBalance(cashAccountIds: string[], date: string, inclusive: boolean): Promise<number> {
    // Query to get cash balance as of a specific date
    const result = await this.prisma.$queryRaw<Array<{balance: Decimal}>>`
      SELECT SUM(COALESCE("debit", 0) - COALESCE("credit", 0)) as balance
      FROM "journal_entry_lines" jel
      JOIN "journal_entries" je ON je.id = jel."journalEntryId"
      WHERE 
        jel."accountId" IN (${cashAccountIds})
        AND je.date ${inclusive ? '<=' : '<'} ${date}
        AND je.status = 'POSTED'
    `;

    return result.length > 0 ? Number(result[0].balance) || 0 : 0;
  }

  private async getAccountActivity(startDate: string, endDate: string): Promise<Record<string, number>> {
    // Query to get net activity for all accounts during the period
    const result = await this.prisma.$queryRaw<Array<{accountId: string, activity: Decimal}>>`
      SELECT 
        "accountId",
        SUM(COALESCE("debit", 0) - COALESCE("credit", 0)) as activity
      FROM "journal_entry_lines" jel
      JOIN "journal_entries" je ON je.id = jel."journalEntryId"
      WHERE 
        je.date >= ${startDate}
        AND je.date <= ${endDate}
        AND je.status = 'POSTED'
      GROUP BY "accountId"
    `;

    // Get all accounts for reference
    const accounts = await this.prisma.account.findMany();
    const accountMap = accounts.reduce((map, account) => {
      map[account.id] = account;
      return map;
    }, {});

    // Build activity map with proper sign based on account type
    const activity: Record<string, number> = {};
    for (const row of result) {
      const account = accountMap[row.accountId];
      if (account) {
        // Apply accounting logic for correct sign
        // Assets and Expenses increase with debits, decrease with credits
        // Liabilities, Equity, and Revenue increase with credits, decrease with debits
        const multiplier = 
          (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) ? 1 : -1;
        
        activity[row.accountId] = Number(row.activity) * multiplier;
      }
    }

    return activity;
  }

  private calculateNetIncome(accountActivity: Record<string, number>): number {
    // Get all revenue and expense accounts
    return 0; // Placeholder - actual implementation would sum revenue and expense accounts
  }

  private async getOperatingActivities(
    accountActivity: Record<string, number>,
    netIncome: number
  ): Promise<CashFlowSection[]> {
    // Simplified operating activities calculation
    const operatingActivities: CashFlowSection[] = [];
    
    // Start with net income
    const netIncomeSection: CashFlowSection = {
      title: 'Net Income',
      items: [
        {
          description: 'Net Income for the period',
          amount: netIncome
        }
      ],
      total: netIncome
    };
    
    operatingActivities.push(netIncomeSection);
    
    // Future: Add adjustments for non-cash items and changes in working capital
    
    return operatingActivities;
  }

  private async getInvestingActivities(
    accountActivity: Record<string, number>
  ): Promise<CashFlowSection[]> {
    // Simplified investing activities implementation
    return [];
  }

  private async getFinancingActivities(
    accountActivity: Record<string, number>
  ): Promise<CashFlowSection[]> {
    // Simplified financing activities implementation
    return [];
  }
} 