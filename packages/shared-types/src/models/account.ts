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
  EXPENSE = 'EXPENSE',
}

/**
 * Account entity representing a GL account
 */
export interface Account {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  isActive: boolean | null;
  parentAccountId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  balance?: number | null;
}

/**
 * Account DTO for API responses
 */
export interface AccountDto {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  isActive: boolean | null;
  parentAccountId?: string | null;
  balance?: number | null;
  children?: AccountDto[];
}

/**
 * DTO for creating a new account
 */
export interface CreateAccountDto {
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  isActive?: boolean | null;
  parentAccountId?: string | null;
}

/**
 * DTO for updating an existing account
 */
export interface UpdateAccountDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  type?: AccountType;
  isActive?: boolean | null;
  parentAccountId?: string | null;
}

/**
 * Transaction entity representing a financial transaction
 */
export interface Transaction {
  id: string | null;
  date: Date;
  description: string | null;
  reference?: string | null;
  entries: TransactionEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  status: TransactionStatus;
}

/**
 * Transaction entry for a line in a transaction
 */
export interface TransactionEntry {
  id: string | null;
  transactionId: string | null;
  accountId: string | null;
  description?: string | null;
  debit: number | null;
  credit: number | null;
}

/**
 * Transaction statuses
 */
export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

/**
 * Transaction DTO for API responses
 */
export interface TransactionDto {
  id: string | null;
  date: Date;
  description: string | null;
  reference?: string | null;
  entries: TransactionEntryDto[];
  createdAt: Date;
  createdBy?: string | null;
  status: TransactionStatus;
}

/**
 * Transaction entry DTO
 */
export interface TransactionEntryDto {
  id: string | null;
  accountId: string | null;
  accountCode?: string | null;
  accountName?: string | null;
  description?: string | null;
  debit: number | null;
  credit: number | null;
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
