import { Account } from './account';

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  account?: Account;
  description?: string;
  debit?: number;
  credit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description?: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  isAdjustment: boolean;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryCreate {
  date: string;
  description?: string;
  reference?: string;
  isAdjustment?: boolean;
  lines: JournalEntryLineCreate[];
}

export interface JournalEntryLineCreate {
  accountId: string;
  description?: string;
  debit?: number;
  credit?: number;
}

export interface JournalEntryUpdate {
  date?: string;
  description?: string;
  reference?: string;
  status?: 'DRAFT' | 'POSTED' | 'REVERSED';
  isAdjustment?: boolean;
  lines?: JournalEntryLineCreate[];
} 