export type ReportType = 'balance-sheet' | 'income-statement' | 'cash-flow' | 'consolidated';

export interface ReportDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface ReportFilter {
  dateRange: ReportDateRange;
  compareWithPreviousPeriod?: boolean;
  department?: string;
  project?: string;
  location?: string;
}

export interface ReportData {
  id: string;
  title: string;
  timestamp: string;
  report: {
    meta: ReportMeta;
    data: any; // Type will be more specific based on report type
  };
}

export interface ReportMeta {
  title: string;
  reportType: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW_STATEMENT';
  startDate?: string;
  endDate: string;
  generatedAt: string;
  comparativePeriod?: boolean;
  department?: string;
  project?: string;
  location?: string;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeNotes?: boolean;
}

// Balance Sheet Report Types
export interface BalanceSheetAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
  previousBalance?: number;
  change?: number;
  changePercentage?: number | null;
}

export interface BalanceSheetSection {
  title: string;
  accounts: BalanceSheetAccount[];
  total: number;
}

export interface BalanceSheetData {
  assets: BalanceSheetSection[];
  liabilities: BalanceSheetSection[];
  equity: BalanceSheetSection[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

// Income Statement Report Types
export interface IncomeStatementAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  previousAmount?: number;
  change?: number;
  changePercentage?: number | null;
}

export interface IncomeStatementSection {
  title: string;
  accounts: IncomeStatementAccount[];
  total: number;
  previousTotal?: number;
  change?: number;
  changePercentage?: number | null;
}

export interface IncomeStatementData {
  revenue: IncomeStatementSection[];
  expenses: IncomeStatementSection[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  previousNetIncome?: number;
  netIncomeChange?: number;
  netIncomeChangePercentage?: number | null;
}

// Cash Flow Report Types
export interface CashFlowItem {
  description: string;
  amount: number;
}

export interface CashFlowSection {
  title: string;
  items: CashFlowItem[];
  total: number;
}

export interface CashFlowData {
  operatingActivities: CashFlowSection[];
  investingActivities: CashFlowSection[];
  financingActivities: CashFlowSection[];
  netCashFromOperatingActivities: number;
  netCashFromInvestingActivities: number;
  netCashFromFinancingActivities: number;
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;
} 