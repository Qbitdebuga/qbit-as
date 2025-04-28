/**
 * Accounts API Client
 * Handles interaction with the Accounts API
 */

import { BaseApiClient } from '../base-client';
import { TokenStorage } from '../utils/token-storage';

export interface Account {
  id: string | null;
  name: string | null;
  number: string | null;
  description?: string | null;
  type: string | null;
  subType?: string | null;
  balance: number | null;
  isActive: boolean | null;
  parentAccountId?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateAccountDto {
  name: string | null;
  number: string | null;
  description?: string | null;
  type: string | null;
  subType?: string | null;
  isActive?: boolean | null;
  parentAccountId?: string | null;
}

export interface UpdateAccountDto {
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  parentAccountId?: string | null;
}

export interface AccountsFilter {
  type?: string | null;
  isActive?: boolean | null;
  search?: string | null;
  parentAccountId?: string | null;
  page?: number | null;
  limit?: number | null;
}

export interface AccountsResponse {
  data: Account[];
  meta: {
    total: number | null;
    page: number | null;
    limit: number | null;
  };
}

export class AccountsClient {
  private client: BaseApiClient;
  private basePath = '/api/v1/accounts';

  constructor(baseUrl: string, tokenStorage: typeof TokenStorage = TokenStorage) {
    this.client = new BaseApiClient(baseUrl, tokenStorage);
  }

  /**
   * Get a list of accounts with optional filtering
   */
  async getAccounts(filter: AccountsFilter = {}): Promise<AccountsResponse> {
    return this?.client.get<AccountsResponse>(this.basePath, {
      params: filter as any,
    });
  }

  /**
   * Get a single account by ID
   */
  async getAccount(id: string): Promise<Account> {
    return this?.client.get<Account>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new account
   */
  async createAccount(account: CreateAccountDto): Promise<Account> {
    return this?.client.post<Account>(this.basePath, account, {
      withCredentials: true, // Include cookies for CSRF protection
    });
  }

  /**
   * Update an existing account
   */
  async updateAccount(id: string, account: UpdateAccountDto): Promise<Account> {
    return this?.client.patch<Account>(`${this.basePath}/${id}`, account, {
      withCredentials: true, // Include cookies for CSRF protection
    });
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    return this?.client.delete<void>(`${this.basePath}/${id}`, {
      withCredentials: true, // Include cookies for CSRF protection
    });
  }

  /**
   * Get the chart of accounts (hierarchical structure)
   */
  async getChartOfAccounts(): Promise<Account[]> {
    return this?.client.get<Account[]>(`${this.basePath}/chart`);
  }

  /**
   * Get account balance history for a given period
   */
  async getAccountBalanceHistory(id: string, startDate: string, endDate: string): Promise<any> {
    return this?.client.get<any>(`${this.basePath}/${id}/balance-history`, {
      params: {
        startDate,
        endDate,
      },
    });
  }
}
