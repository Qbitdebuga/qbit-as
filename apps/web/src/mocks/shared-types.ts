/**
 * Mock shared types for the web app
 * These are temporary mocks to allow the build to complete successfully
 */

// Mock shared types for the billing system

export enum BillStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export interface Bill {
  id: string;
  billNumber: string;
  status: BillStatus;
  vendor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  date: string;
  dueDate: string;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  reference?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    account?: {
      id: string;
      name: string;
      code: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BillCreate {
  vendorId: string;
  date: string;
  dueDate: string;
  reference?: string;
  notes?: string;
  terms?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    accountId: string;
  }>;
}

export interface BillUpdate {
  vendorId?: string;
  date?: string;
  dueDate?: string;
  reference?: string;
  notes?: string;
  terms?: string;
  lineItems?: Array<{
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    accountId: string;
  }>;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountSubType {
  CASH = 'CASH',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  FIXED_ASSET = 'FIXED_ASSET',
  ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  ACCRUED_LIABILITIES = 'ACCRUED_LIABILITIES',
  LONG_TERM_DEBT = 'LONG_TERM_DEBT',
  COMMON_STOCK = 'COMMON_STOCK',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  SALES = 'SALES',
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  PAYROLL_EXPENSE = 'PAYROLL_EXPENSE',
  DEPRECIATION_EXPENSE = 'DEPRECIATION_EXPENSE',
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
  OTHER_INCOME = 'OTHER_INCOME',
  TAX_EXPENSE = 'TAX_EXPENSE',
  OTHER = 'OTHER',
}

// Statement period for financial reports
export enum StatementPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED'
}

// DTO types for financial statements
export interface BalanceSheetStatementDto {
  asOfDate: string;
  assets: {
    total: number;
    categories: {
      name: string;
      total: number;
      accounts: {
        code: string;
        name: string;
        balance: number;
      }[];
    }[];
  };
  liabilities: {
    total: number;
    categories: {
      name: string;
      total: number;
      accounts: {
        code: string;
        name: string;
        balance: number;
      }[];
    }[];
  };
  equity: {
    total: number;
    categories: {
      name: string;
      total: number;
      accounts: {
        code: string;
        name: string;
        balance: number;
      }[];
    }[];
  };
}

export interface IncomeStatementDto {
  startDate: string;
  endDate: string;
  revenue: {
    total: number;
    categories: {
      name: string;
      total: number;
      accounts: {
        code: string;
        name: string;
        amount: number;
      }[];
    }[];
  };
  expenses: {
    total: number;
    categories: {
      name: string;
      total: number;
      accounts: {
        code: string;
        name: string;
        amount: number;
      }[];
    }[];
  };
  netIncome: number;
}

export interface CashFlowStatementDto {
  startDate: string;
  endDate: string;
  operatingActivities: {
    total: number;
    items: {
      description: string;
      amount: number;
    }[];
  };
  investingActivities: {
    total: number;
    items: {
      description: string;
      amount: number;
    }[];
  };
  financingActivities: {
    total: number;
    items: {
      description: string;
      amount: number;
    }[];
  };
  netCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
} 