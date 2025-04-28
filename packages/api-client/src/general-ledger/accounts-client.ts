import {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  AccountWithHierarchy,
  AccountTransactionsDto,
} from '@qbit/shared-types';

import { GeneralLedgerClient } from './general-ledger-client';

/**
 * Client specifically for account-related operations
 * This is a convenience wrapper around the GeneralLedgerClient
 */
export class AccountsClient {
  private readonly glClient: GeneralLedgerClient;

  constructor(glClient: GeneralLedgerClient) {
    this.glClient = glClient;
  }

  /**
   * Get all accounts in the chart of accounts
   */
  async getAccounts(): Promise<Account[]> {
    return this?.glClient.getAccounts();
  }

  /**
   * Get a specific account by ID
   */
  async getAccount(accountId: string): Promise<Account> {
    return this?.glClient.getAccountById(accountId);
  }

  /**
   * Get accounts in a hierarchical structure
   */
  async getAccountHierarchy(): Promise<AccountWithHierarchy[]> {
    return this?.glClient.getAccountHierarchy();
  }

  /**
   * Create a new account
   */
  async createAccount(accountData: CreateAccountDto): Promise<Account> {
    return this?.glClient.createAccount(accountData);
  }

  /**
   * Update an existing account
   */
  async updateAccount(accountId: string, accountData: UpdateAccountDto): Promise<Account> {
    return this?.glClient.updateAccount(accountId, accountData);
  }

  /**
   * Delete an account
   */
  async deleteAccount(accountId: string): Promise<void> {
    await this?.glClient.deleteAccount(accountId);
  }

  /**
   * Get transactions for a specific account
   */
  async getAccountTransactions(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AccountTransactionsDto> {
    return this?.glClient.getAccountTransactions(accountId, startDate, endDate);
  }
}
