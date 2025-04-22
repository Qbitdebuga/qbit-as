import { JournalEntry, JournalEntryCreate } from './journal-entry';

export enum BatchStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface BatchProcess {
  id: string;
  batchNumber: string;
  description?: string;
  status: BatchStatus;
  itemCount: number;
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface JournalEntryBatch extends BatchProcess {
  entries?: JournalEntry[];
}

export interface JournalEntryBatchCreate {
  description?: string;
  entries: JournalEntryCreate[];
}

export interface JournalEntryBatchItem {
  id: string;
  batchId: string;
  journalEntryId?: string;
  entryData: JournalEntryCreate;
  status: BatchStatus;
  errorMessage?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchProcessResult {
  batchId: string;
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: BatchProcessError[];
}

export interface BatchProcessError {
  itemId: string;
  message: string;
  details?: any;
} 