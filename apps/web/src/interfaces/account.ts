export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum AccountSubType {
  // Asset subtypes
  CASH = 'CASH',
  BANK = 'BANK',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  FIXED_ASSET = 'FIXED_ASSET',
  OTHER_ASSET = 'OTHER_ASSET',
  
  // Liability subtypes
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  CREDIT_CARD = 'CREDIT_CARD',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  OTHER_LIABILITY = 'OTHER_LIABILITY',
  
  // Equity subtypes
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  OWNERS_EQUITY = 'OWNERS_EQUITY',
  
  // Revenue subtypes
  SALES = 'SALES',
  SERVICE_REVENUE = 'SERVICE_REVENUE',
  DISCOUNT = 'DISCOUNT',
  OTHER_INCOME = 'OTHER_INCOME',
  
  // Expense subtypes
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  PAYROLL = 'PAYROLL',
  GENERAL_ADMIN = 'GENERAL_ADMIN',
  DEPRECIATION = 'DEPRECIATION',
  OTHER_EXPENSE = 'OTHER_EXPENSE'
}

export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  subType?: AccountSubType;
  isActive: boolean;
  parentAccountId?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Account[];
}

export interface CreateAccountDto {
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  subType?: AccountSubType;
  isActive?: boolean;
  parentAccountId?: string;
}

export interface UpdateAccountDto {
  accountNumber?: string;
  name?: string;
  description?: string;
  type?: AccountType;
  subType?: AccountSubType;
  isActive?: boolean;
  parentAccountId?: string;
}

export interface AccountFilters {
  type?: AccountType;
  subType?: AccountSubType;
  isActive?: boolean;
  parentAccountId?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeChildren?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AccountHierarchy {
  id: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  subType?: AccountSubType;
  balance: number;
  children: AccountHierarchy[];
  depth: number;
  path: string[];
}

export interface AccountBalance {
  accountId: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  previousBalance?: number;
  change?: number;
  changePercentage?: number;
} 