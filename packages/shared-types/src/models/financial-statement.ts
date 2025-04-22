export enum StatementPeriod {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM'
}

export interface StatementRequestDto {
  startDate: string;
  endDate: string;
  period: StatementPeriod;
  comparativePeriod?: boolean;
  includeZeroBalances?: boolean;
}

export interface StatementResponseDto {
  meta: {
    title: string;
    reportType: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
    period: StatementPeriod;
    comparativePeriod?: boolean;
  };
  data: any;
}

export interface BalanceSheetStatementDto extends StatementResponseDto {
  data: {
    assets: BalanceSheetSection[];
    liabilities: BalanceSheetSection[];
    equity: BalanceSheetSection[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
  };
}

export interface BalanceSheetSection {
  title: string;
  accounts: BalanceSheetAccount[];
  total: number;
}

export interface BalanceSheetAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
  previousBalance?: number;
  change?: number;
  changePercentage?: number;
}

export interface IncomeStatementDto extends StatementResponseDto {
  data: {
    revenue: IncomeStatementSection[];
    expenses: IncomeStatementSection[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    previousNetIncome?: number;
    netIncomeChange?: number;
    netIncomeChangePercentage?: number;
  };
}

export interface IncomeStatementSection {
  title: string;
  accounts: IncomeStatementAccount[];
  total: number;
  previousTotal?: number;
  change?: number;
  changePercentage?: number;
}

export interface IncomeStatementAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  previousAmount?: number;
  change?: number;
  changePercentage?: number;
}

export interface CashFlowStatementDto extends StatementResponseDto {
  data: {
    operatingActivities: CashFlowSection[];
    investingActivities: CashFlowSection[];
    financingActivities: CashFlowSection[];
    netCashFromOperatingActivities: number;
    netCashFromInvestingActivities: number;
    netCashFromFinancingActivities: number;
    netChangeInCash: number;
    beginningCash: number;
    endingCash: number;
  };
}

export interface CashFlowSection {
  title: string;
  items: CashFlowItem[];
  total: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  accountId?: string;
  accountCode?: string;
  accountName?: string;
} 