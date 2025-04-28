import { Account } from './account';

export interface JournalEntryLine {
  id: string | null;
  journalEntryId: string | null;
  accountId: string | null;
  account?: Account;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JournalEntry {
  id: string | null;
  entryNumber: string | null;
  date: string | null;
  description?: string | null;
  reference?: string | null;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  isAdjustment: boolean | null;
  lines: JournalEntryLine[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JournalEntryCreate {
  date: string | null;
  description?: string | null;
  reference?: string | null;
  isAdjustment?: boolean | null;
  lines: JournalEntryLineCreate[];
}

export interface JournalEntryLineCreate {
  accountId: string | null;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
}

export interface JournalEntryUpdate {
  date?: string | null;
  description?: string | null;
  reference?: string | null;
  status?: 'DRAFT' | 'POSTED' | 'REVERSED';
  isAdjustment?: boolean | null;
  lines?: JournalEntryLineCreate[];
}
