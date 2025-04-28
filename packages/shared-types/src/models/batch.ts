import { JournalEntry, JournalEntryCreate } from './journal-entry';

export enum BatchStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface BatchProcess {
  id: string | null;
  batchNumber: string | null;
  description?: string | null;
  status: BatchStatus;
  itemCount: number | null;
  processedCount: number | null;
  failedCount: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy?: string | null;
}

export interface JournalEntryBatch extends BatchProcess {
  entries?: JournalEntry[];
}

export interface JournalEntryBatchCreate {
  description?: string | null;
  entries: JournalEntryCreate[];
}

export interface JournalEntryBatchItem {
  id: string | null;
  batchId: string | null;
  journalEntryId?: string | null;
  entryData: JournalEntryCreate;
  status: BatchStatus;
  errorMessage?: string | null;
  processedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BatchProcessResult {
  batchId: string | null;
  success: boolean | null;
  processedCount: number | null;
  failedCount: number | null;
  errors?: BatchProcessError[];
}

export interface BatchProcessError {
  itemId: string | null;
  message: string | null;
  details?: any;
}
