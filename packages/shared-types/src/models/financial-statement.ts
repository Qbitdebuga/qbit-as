export enum StatementPeriod {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export interface StatementRequestDto {
  startDate: string | null;
  endDate: string | null;
  period: StatementPeriod;
  comparativePeriod?: boolean | null;
  includeZeroBalances?: boolean | null;
}

export interface StatementResponseDto {
  meta: {
    title: string | null;
    reportType: string | null;
    startDate: string | null;
    endDate: string | null;
    generatedAt: string | null;
    period: StatementPeriod;
    comparativePeriod?: boolean | null;
  };
  data: any;
}

export interface BalanceSheetStatementDto extends StatementResponseDto {
  data: {
    assets: BalanceSheetSection[];
    liabilities: BalanceSheetSection[];
    equity: BalanceSheetSection[];
    totalAssets: number | null;
    totalLiabilities: number | null;
    totalEquity: number | null;
    totalLiabilitiesAndEquity: number | null;
  };
}

export interface BalanceSheetSection {
  title: string | null;
  accounts: BalanceSheetAccount[];
  total: number | null;
}

export interface BalanceSheetAccount {
  accountId: string | null;
  accountCode: string | null;
  accountName: string | null;
  balance: number | null;
  previousBalance?: number | null;
  change?: number | null;
  changePercentage?: number | null;
}

export interface IncomeStatementDto extends StatementResponseDto {
  data: {
    revenue: IncomeStatementSection[];
    expenses: IncomeStatementSection[];
    totalRevenue: number | null;
    totalExpenses: number | null;
    netIncome: number | null;
    previousNetIncome?: number | null;
    netIncomeChange?: number | null;
    netIncomeChangePercentage?: number | null;
  };
}

export interface IncomeStatementSection {
  title: string | null;
  accounts: IncomeStatementAccount[];
  total: number | null;
  previousTotal?: number | null;
  change?: number | null;
  changePercentage?: number | null;
}

export interface IncomeStatementAccount {
  accountId: string | null;
  accountCode: string | null;
  accountName: string | null;
  amount: number | null;
  previousAmount?: number | null;
  change?: number | null;
  changePercentage?: number | null;
}

export interface CashFlowStatementDto extends StatementResponseDto {
  data: {
    operatingActivities: CashFlowSection[];
    investingActivities: CashFlowSection[];
    financingActivities: CashFlowSection[];
    netCashFromOperatingActivities: number | null;
    netCashFromInvestingActivities: number | null;
    netCashFromFinancingActivities: number | null;
    netChangeInCash: number | null;
    beginningCash: number | null;
    endingCash: number | null;
  };
}

export interface CashFlowSection {
  title: string | null;
  items: CashFlowItem[];
  total: number | null;
}

export interface CashFlowItem {
  description: string | null;
  amount: number | null;
  accountId?: string | null;
  accountCode?: string | null;
  accountName?: string | null;
}
