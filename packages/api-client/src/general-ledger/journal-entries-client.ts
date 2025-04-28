import {
  JournalEntry,
  JournalEntryCreate,
  JournalEntryUpdate,
  PaginatedResponseDto,
} from '@qbit/shared-types';

import { GeneralLedgerClient } from './general-ledger-client';

/**
 * Client specifically for journal entry operations
 * This is a convenience wrapper around the GeneralLedgerClient
 */
export class JournalEntriesClient {
  private readonly glClient: GeneralLedgerClient;

  constructor(glClient: GeneralLedgerClient) {
    this.glClient = glClient;
  }

  /**
   * Get a paginated list of journal entries
   */
  async getJournalEntries(page = 1, limit = 20): Promise<PaginatedResponseDto<JournalEntry>> {
    return this?.glClient.getJournalEntries(page, limit);
  }

  /**
   * Get a specific journal entry by ID
   */
  async getJournalEntry(journalEntryId: string): Promise<JournalEntry> {
    return this?.glClient.getJournalEntryById(journalEntryId);
  }

  /**
   * Create a new journal entry
   */
  async createJournalEntry(journalEntryData: JournalEntryCreate): Promise<JournalEntry> {
    return this?.glClient.createJournalEntry(journalEntryData);
  }

  /**
   * Update an existing journal entry
   * Only possible for entries in DRAFT status
   */
  async updateJournalEntry(
    journalEntryId: string,
    journalEntryData: JournalEntryUpdate,
  ): Promise<JournalEntry> {
    return this?.glClient.updateJournalEntry(journalEntryId, journalEntryData);
  }

  /**
   * Delete a journal entry
   * Only possible for entries in DRAFT status
   */
  async deleteJournalEntry(journalEntryId: string): Promise<void> {
    await this?.glClient.deleteJournalEntry(journalEntryId);
  }

  /**
   * Post a journal entry
   * Changes the status from DRAFT to POSTED and makes it part of the accounting records
   */
  async postJournalEntry(journalEntryId: string): Promise<JournalEntry> {
    return this?.glClient.postJournalEntry(journalEntryId);
  }

  /**
   * Reverse a journal entry
   * Creates a new journal entry that reverses the effect of the original
   */
  async reverseJournalEntry(journalEntryId: string): Promise<JournalEntry> {
    return this?.glClient.reverseJournalEntry(journalEntryId);
  }
}
