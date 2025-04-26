declare module '@qbit/shared-types' {
  // User types
  export interface UserDto {
    id: string;
    email: string;
    name: string;
    roles: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  // Vendor types
  export interface Vendor {
    id: number;
    vendorNumber: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    taxId?: string;
    website?: string;
    notes?: string;
    isActive: boolean;
    paymentTerms?: string;
    defaultAccountId?: number;
    creditLimit?: number;
    createdAt: Date;
    updatedAt: Date;
  }

  // Bill types
  export enum BillStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    VOID = 'VOID',
    CANCELLED = 'CANCELLED'
  }

  export interface BillLineItem {
    id?: number;
    billId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    accountId?: number;
    accountCode?: string;
    taxRate?: number;
    taxAmount?: number;
  }

  export interface Bill {
    id: number;
    billNumber: string;
    vendorId: number;
    vendor?: any;
    invoiceNumber: string;
    reference?: string;
    issueDate: Date;
    dueDate: Date;
    status: BillStatus;
    subtotal: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    notes?: string;
    terms?: string;
    lineItems?: BillLineItem[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CreateBillDto {
    vendorId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: BillStatus;
    notes?: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    lineItems: BillLineItem[];
  }

  // Payment types
  export enum PaymentMethod {
    CASH = 'CASH',
    CHECK = 'CHECK',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    WIRE = 'WIRE',
    ACH = 'ACH',
    PAYPAL = 'PAYPAL',
    STRIPE = 'STRIPE',
    OTHER = 'OTHER'
  }

  export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    VOIDED = 'VOIDED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
    CANCELLED = 'CANCELLED'
  }

  export interface PaymentApplication {
    id: number;
    paymentId: number;
    billId: number;
    bill?: any;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Payment {
    id: number;
    paymentNumber: string;
    vendorId: number;
    vendor?: any;
    paymentDate: Date;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    memo?: string;
    status: PaymentStatus;
    bankAccountId?: number;
    applications?: PaymentApplication[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CreatePaymentDto {
    paymentNumber?: string;
    vendorId: number;
    paymentDate: Date;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    memo?: string;
    status?: PaymentStatus;
    bankAccountId?: number;
    applications: { billId: number; amount: number }[];
  }

  export interface UpdatePaymentDto {
    paymentDate?: Date;
    amount?: number;
    paymentMethod?: PaymentMethod;
    reference?: string;
    memo?: string;
    status?: PaymentStatus;
    bankAccountId?: number;
  }

  export interface ApplyPaymentDto {
    paymentId: number;
    applications: { billId: number; amount: number }[];
  }

  export interface PaymentListParams {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    vendorId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }

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