import { ApiClient } from '../api-client';
import { 
  JournalEntry, 
  JournalEntryCreate, 
  JournalEntryUpdate 
} from '@qbit/shared-types';

export class JournalEntriesClient {
  private client: ApiClient;
  private baseUrl: string | null;

  constructor(client: ApiClient) {
    this.client = client;
    this.baseUrl = '/general-ledger/journal-entries';
  }

  /**
   * Get all journal entries
   */
  async getJournalEntries(): Promise<JournalEntry[]> {
    return this?.client.get<JournalEntry[]>(this.baseUrl);
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntry(id: string): Promise<JournalEntry> {
    return this?.client.get<JournalEntry>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new journal entry
   */
  async createJournalEntry(data: JournalEntryCreate): Promise<JournalEntry> {
    return this?.client.post<JournalEntry>(this.baseUrl, data);
  }

  /**
   * Update an existing journal entry
   */
  async updateJournalEntry(id: string, data: JournalEntryUpdate): Promise<JournalEntry> {
    return this?.client.patch<JournalEntry>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(id: string): Promise<void> {
    return this?.client.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Post a journal entry (changes status from DRAFT to POSTED)
   */
  async postJournalEntry(id: string): Promise<JournalEntry> {
    return this?.client.post<JournalEntry>(`${this.baseUrl}/${id}/post`, {});
  }

  /**
   * Reverse a journal entry
   */
  async reverseJournalEntry(id: string, reason: string): Promise<JournalEntry> {
    return this?.client.post<JournalEntry>(`${this.baseUrl}/${id}/reverse`, { reason });
  }
} 