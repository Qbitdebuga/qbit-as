/**
 * General Ledger Service Interfaces
 * Define the contracts for General Ledger Service communication
 */

import { 
  Account, 
  CreateAccountDto, 
  UpdateAccountDto, 
  AccountWithHierarchy 
} from '../models/account';

import { 
  JournalEntry, 
  JournalEntryCreate, 
  JournalEntryUpdate 
} from '../models/journal-entry';

import {
  StatementRequestDto,
  BalanceSheetStatementDto,
  IncomeStatementDto,
  CashFlowStatementDto
} from '../models/financial-statement';

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface BalanceSheetSummaryDto {
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  asOfDate: string;
}

export interface IncomeStatementSummaryDto {
  revenue: number;
  expenses: number;
  netIncome: number;
  startDate: string;
  endDate: string;
}

export interface AccountTransactionsDto {
  accountId: string;
  accountName: string;
  accountCode: string;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    reference?: string;
    debit?: number;
    credit?: number;
  }>;
  balance: number;
}

/**
 * General Ledger Service Interface - defines the methods available on the GL Service
 */
export interface IGeneralLedgerService {
  // Account management
  getAccounts(): Promise<Account[]>;
  getAccountById(accountId: string): Promise<Account>;
  getAccountHierarchy(): Promise<AccountWithHierarchy[]>;
  createAccount(createAccountDto: CreateAccountDto): Promise<Account>;
  updateAccount(accountId: string, updateAccountDto: UpdateAccountDto): Promise<Account>;
  deleteAccount(accountId: string): Promise<void>;
  
  // Journal entry management
  getJournalEntries(page?: number, limit?: number): Promise<PaginatedResponseDto<JournalEntry>>;
  getJournalEntryById(journalEntryId: string): Promise<JournalEntry>;
  createJournalEntry(journalEntryCreate: JournalEntryCreate): Promise<JournalEntry>;
  updateJournalEntry(journalEntryId: string, journalEntryUpdate: JournalEntryUpdate): Promise<JournalEntry>;
  deleteJournalEntry(journalEntryId: string): Promise<void>;
  postJournalEntry(journalEntryId: string): Promise<JournalEntry>;
  reverseJournalEntry(journalEntryId: string): Promise<JournalEntry>;
  
  // Financial statement generation
  getBalanceSheet(request: StatementRequestDto): Promise<BalanceSheetStatementDto>;
  getIncomeStatement(request: StatementRequestDto): Promise<IncomeStatementDto>;
  getCashFlowStatement(request: StatementRequestDto): Promise<CashFlowStatementDto>;
  
  // Summary data
  getBalanceSheetSummary(asOfDate?: string): Promise<BalanceSheetSummaryDto>;
  getIncomeStatementSummary(startDate?: string, endDate?: string): Promise<IncomeStatementSummaryDto>;
  
  // Account transactions
  getAccountTransactions(accountId: string, startDate?: string, endDate?: string): Promise<AccountTransactionsDto>;
  
  // Trial balance
  getTrialBalance(asOfDate?: string): Promise<any>; // Trial balance is not yet defined in shared models
} 