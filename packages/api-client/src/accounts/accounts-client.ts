import { ApiClient } from '../api-client';
import { Account, AccountCreate, AccountUpdate } from './types';

export class AccountsClient {
  private client: ApiClient;
  private baseUrl: string;

  constructor(client: ApiClient) {
    this.client = client;
    this.baseUrl = '/general-ledger/accounts';
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<Account[]> {
    return this.client.get<Account[]>(this.baseUrl);
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<Account> {
    return this.client.get<Account>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new account
   */
  async createAccount(data: AccountCreate): Promise<Account> {
    return this.client.post<Account>(this.baseUrl, data);
  }

  /**
   * Update an existing account
   */
  async updateAccount(id: string, data: AccountUpdate): Promise<Account> {
    return this.client.patch<Account>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    return this.client.delete(`${this.baseUrl}/${id}`);
  }
} 