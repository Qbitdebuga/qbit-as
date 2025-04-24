import { ApiClient } from '../api-client';
import { ApiClientBase } from '../utils/api-client-base';
import { Account, AccountCreate, AccountUpdate } from './types';

export class AccountsClient extends ApiClientBase {
  private baseUrl: string;

  constructor(apiClient: ApiClient) {
    super(apiClient);
    this.baseUrl = '/general-ledger/accounts';
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<Account[]> {
    return this.get<Account[]>(this.baseUrl);
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<Account> {
    return this.get<Account>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new account
   */
  async createAccount(data: AccountCreate): Promise<Account> {
    return this.post<Account>(this.baseUrl, data);
  }

  /**
   * Update an existing account
   */
  async updateAccount(id: string, data: AccountUpdate): Promise<Account> {
    return this.patch<Account>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    return this.delete(`${this.baseUrl}/${id}`);
  }
} 