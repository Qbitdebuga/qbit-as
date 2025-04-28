export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
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
  OTHER = 'OTHER'
}

export interface Account {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean | null;
  parentId?: string | null;
  parent?: Account;
  children?: Account[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AccountCreate {
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  subtype: AccountSubType;
  isActive?: boolean | null;
  parentId?: string | null;
}

export interface AccountUpdate {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  type?: AccountType;
  subtype?: AccountSubType;
  isActive?: boolean | null;
  parentId?: string | null;
} 