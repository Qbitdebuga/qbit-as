import { ApiClient } from '../api-client';
import { 
  JournalEntryBatch, 
  JournalEntryBatchCreate, 
  BatchStatus, 
  BatchProcessResult 
} from '@qbit/shared-types';

export class BatchClient {
  private client: ApiClient;
  private baseUrl: string;

  constructor(client: ApiClient) {
    this.client = client;
    this.baseUrl = '/general-ledger/batch';
  }

  /**
   * Create a new batch of journal entries
   */
  async createBatch(data: JournalEntryBatchCreate): Promise<JournalEntryBatch> {
    return this.client.post<JournalEntryBatch>(this.baseUrl, data);
  }

  /**
   * Get all batches with pagination
   */
  async getBatches(skip = 0, take = 10): Promise<{ data: JournalEntryBatch[], meta: { total: number, skip: number, take: number } }> {
    return this.client.get<{ data: JournalEntryBatch[], meta: { total: number, skip: number, take: number } }>(
      `${this.baseUrl}?skip=${skip}&take=${take}`
    );
  }

  /**
   * Get batch by ID
   */
  async getBatch(id: string): Promise<JournalEntryBatch> {
    return this.client.get<JournalEntryBatch>(`${this.baseUrl}/${id}`);
  }

  /**
   * Process a batch (start the processing)
   */
  async processBatch(id: string): Promise<{ id: string, status: BatchStatus, message: string }> {
    return this.client.post<{ id: string, status: BatchStatus, message: string }>(
      `${this.baseUrl}/${id}/process`, 
      {}
    );
  }

  /**
   * Cancel a batch
   */
  async cancelBatch(id: string): Promise<{ id: string, status: BatchStatus, message: string }> {
    return this.client.post<{ id: string, status: BatchStatus, message: string }>(
      `${this.baseUrl}/${id}/cancel`, 
      {}
    );
  }
} 