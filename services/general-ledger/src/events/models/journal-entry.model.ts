import { JournalEntry as PrismaJournalEntry } from '@prisma/client';

export interface JournalEntryWithExtraFields extends PrismaJournalEntry {
  totalAmount?: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

/**
 * Base event payload structure for journal entry events
 */
export interface JournalEntryEventPayload {
  id: string;
  serviceSource: string;
  entityType: string;
  timestamp: string;
}

/**
 * Created event payload
 */
export interface JournalEntryCreatedPayload extends JournalEntryEventPayload {
  date: Date;
  reference: string;
  description: string;
  status: string; // DRAFT, POSTED, REVERSED
  totalAmount: number;
  createdBy: string;
  lines: JournalEntryLine[];
}

/**
 * Updated event payload
 */
export interface JournalEntryUpdatedPayload extends JournalEntryEventPayload {
  date: Date;
  reference: string;
  description: string;
  status: string; // DRAFT, POSTED, REVERSED
  totalAmount: number;
  updatedBy: string;
  lines: JournalEntryLine[];
}

/**
 * Deleted event payload - only contains the ID reference
 */
export interface JournalEntryDeletedPayload extends JournalEntryEventPayload {
  // No additional fields beyond the base payload
}

/**
 * Posted event payload
 */
export interface JournalEntryPostedPayload extends JournalEntryEventPayload {
  date: Date;
  reference: string;
  status: string; // POSTED
} 