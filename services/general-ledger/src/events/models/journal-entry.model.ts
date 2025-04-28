import { JournalEntry as EntityJournalEntry } from '../../journal-entries/entities/journal-entry.entity';

export interface JournalEntryWithExtraFields extends EntityJournalEntry {
  totalAmount?: number | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface JournalEntryLine {
  id: string | null;
  journalEntryId: string | null;
  accountId: string | null;
  description?: string | null;
  debit: number | null;
  credit: number | null;
}

/**
 * Base event payload structure for journal entry events
 */
export interface JournalEntryEventPayload {
  id: string | null;
  serviceSource: string | null;
  entityType: string | null;
  timestamp: string | null;
}

/**
 * Created event payload
 */
export interface JournalEntryCreatedPayload extends JournalEntryEventPayload {
  date: Date;
  reference: string | null;
  description: string | null;
  status: string | null; // DRAFT, POSTED, REVERSED
  totalAmount: number | null;
  createdBy: string | null;
  lines: JournalEntryLine[];
}

/**
 * Updated event payload
 */
export interface JournalEntryUpdatedPayload extends JournalEntryEventPayload {
  date: Date;
  reference: string | null;
  description: string | null;
  status: string | null; // DRAFT, POSTED, REVERSED
  totalAmount: number | null;
  updatedBy: string | null;
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
  reference: string | null;
  status: string | null; // POSTED
} 