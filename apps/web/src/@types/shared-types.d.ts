declare module '@qbit/shared-types' {
  // Account types
  export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
  }

  // Balance Sheet types
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

  export interface ReportMeta {
    title: string;
    reportType: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW_STATEMENT';
    startDate?: string;
    endDate: string;
    generatedAt: string;
    comparativePeriod?: boolean;
  }

  export interface BalanceSheetStatementDto {
    meta: ReportMeta;
    data: BalanceSheetData;
  }

  // Income Statement types
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

  export interface IncomeStatementDto {
    meta: ReportMeta;
    data: IncomeStatementData;
  }

  // Cash Flow types
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

  export interface CashFlowStatementDto {
    meta: ReportMeta;
    data: CashFlowData;
  }
} 