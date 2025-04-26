/**
 * Account-related models for the QBit system
 */

/**
 * Account types in the general ledger
 */
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

/**
 * Account entity representing a GL account
 */
export interface Account {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  isActive: boolean;
  parentAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
  balance?: number;
}

/**
 * Account DTO for API responses
 */
export interface AccountDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  isActive: boolean;
  parentAccountId?: string;
  balance?: number;
  children?: AccountDto[];
}

/**
 * DTO for creating a new account
 */
export interface CreateAccountDto {
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  isActive?: boolean;
  parentAccountId?: string;
}

/**
 * DTO for updating an existing account
 */
export interface UpdateAccountDto {
  code?: string;
  name?: string;
  description?: string;
  type?: AccountType;
  isActive?: boolean;
  parentAccountId?: string;
}

/**
 * Transaction entity representing a financial transaction
 */
export interface Transaction {
  id: string;
  date: Date;
  description: string;
  reference?: string;
  entries: TransactionEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  status: TransactionStatus;
}

/**
 * Transaction entry for a line in a transaction
 */
export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

/**
 * Transaction statuses
 */
export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED'
}

/**
 * Transaction DTO for API responses
 */
export interface TransactionDto {
  id: string;
  date: Date;
  description: string;
  reference?: string;
  entries: TransactionEntryDto[];
  createdAt: Date;
  createdBy?: string;
  status: TransactionStatus;
}

/**
 * Transaction entry DTO
 */
export interface TransactionEntryDto {
  id: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  description?: string;
  debit: number;
  credit: number;
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

export interface AccountWithHierarchy extends Account {
  parent?: Account;
  children?: Account[];
} 