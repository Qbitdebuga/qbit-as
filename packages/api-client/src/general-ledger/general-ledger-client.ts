import { 
  IGeneralLedgerService, 
  Account, 
  CreateAccountDto, 
  UpdateAccountDto, 
  AccountWithHierarchy,
  JournalEntry,
  JournalEntryCreate,
  JournalEntryUpdate,
  PaginatedResponseDto,
  StatementRequestDto,
  BalanceSheetStatementDto,
  IncomeStatementDto,
  CashFlowStatementDto,
  BalanceSheetSummaryDto,
  IncomeStatementSummaryDto,
  AccountTransactionsDto
} from '@qbit/shared-types';

import { ServiceAuthClient } from '../auth/service-auth-client';

/**
 * General Ledger client for interacting with the GL service
 * Implements the IGeneralLedgerService interface for type safety
 */
export class GeneralLedgerClient implements IGeneralLedgerService {
  private readonly apiUrl: string;
  private readonly serviceAuthClient?: ServiceAuthClient;
  private readonly accessToken?: string;

  /**
   * Create a new GL client either with a service auth client for server-to-server
   * communication, or with an access token for frontend usage
   */
  constructor(
    apiUrl: string, 
    authOptions?: { 
      serviceAuthClient?: ServiceAuthClient;
      accessToken?: string;
    }
  ) {
    this.apiUrl = apiUrl;
    
    if (authOptions) {
      this.serviceAuthClient = authOptions.serviceAuthClient;
      this.accessToken = authOptions.accessToken;
    }
  }

  /**
   * Helper method to make authenticated requests
   */
  private async request<T>(
    path: string, 
    options: RequestInit = {}, 
    scopes: string[] = ['gl:read']
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    
    // If using service auth client, delegate to it
    if (this.serviceAuthClient) {
      return this.serviceAuthClient.makeAuthenticatedRequest<T>(url, options, scopes);
    }
    
    // Otherwise use the access token directly
    if (this.accessToken) {
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }
      
      return response.json();
    }
    
    throw new Error('No authentication method provided');
  }

  /**
   * Account Management Methods
   */
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>('/accounts');
  }

  async getAccountById(accountId: string): Promise<Account> {
    return this.request<Account>(`/accounts/${accountId}`);
  }

  async getAccountHierarchy(): Promise<AccountWithHierarchy[]> {
    return this.request<AccountWithHierarchy[]>('/accounts/hierarchy');
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(createAccountDto)
    }, ['gl:write']);
  }

  async updateAccount(accountId: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    return this.request<Account>(`/accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateAccountDto)
    }, ['gl:write']);
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.request<void>(`/accounts/${accountId}`, {
      method: 'DELETE'
    }, ['gl:write']);
  }

  /**
   * Journal Entry Management Methods
   */
  async getJournalEntries(page = 1, limit = 20): Promise<PaginatedResponseDto<JournalEntry>> {
    return this.request<PaginatedResponseDto<JournalEntry>>(`/journal-entries?page=${page}&limit=${limit}`);
  }

  async getJournalEntryById(journalEntryId: string): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/journal-entries/${journalEntryId}`);
  }

  async createJournalEntry(journalEntryCreate: JournalEntryCreate): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal-entries', {
      method: 'POST',
      body: JSON.stringify(journalEntryCreate)
    }, ['gl:write']);
  }

  async updateJournalEntry(journalEntryId: string, journalEntryUpdate: JournalEntryUpdate): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/journal-entries/${journalEntryId}`, {
      method: 'PATCH',
      body: JSON.stringify(journalEntryUpdate)
    }, ['gl:write']);
  }

  async deleteJournalEntry(journalEntryId: string): Promise<void> {
    await this.request<void>(`/journal-entries/${journalEntryId}`, {
      method: 'DELETE'
    }, ['gl:write']);
  }

  async postJournalEntry(journalEntryId: string): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/journal-entries/${journalEntryId}/post`, {
      method: 'POST'
    }, ['gl:write']);
  }

  async reverseJournalEntry(journalEntryId: string): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/journal-entries/${journalEntryId}/reverse`, {
      method: 'POST'
    }, ['gl:write']);
  }

  /**
   * Financial Statement Methods
   */
  async getBalanceSheet(request: StatementRequestDto): Promise<BalanceSheetStatementDto> {
    return this.request<BalanceSheetStatementDto>('/financial-statements/balance-sheet', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getIncomeStatement(request: StatementRequestDto): Promise<IncomeStatementDto> {
    return this.request<IncomeStatementDto>('/financial-statements/income-statement', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getCashFlowStatement(request: StatementRequestDto): Promise<CashFlowStatementDto> {
    return this.request<CashFlowStatementDto>('/financial-statements/cash-flow', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Summary Data Methods
   */
  async getBalanceSheetSummary(asOfDate?: string): Promise<BalanceSheetSummaryDto> {
    const query = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.request<BalanceSheetSummaryDto>(`/financial-statements/balance-sheet/summary${query}`);
  }

  async getIncomeStatementSummary(startDate?: string, endDate?: string): Promise<IncomeStatementSummaryDto> {
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    const query = params.length ? `?${params.join('&')}` : '';
    
    return this.request<IncomeStatementSummaryDto>(`/financial-statements/income-statement/summary${query}`);
  }

  /**
   * Account Transactions
   */
  async getAccountTransactions(accountId: string, startDate?: string, endDate?: string): Promise<AccountTransactionsDto> {
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    const query = params.length ? `?${params.join('&')}` : '';
    
    return this.request<AccountTransactionsDto>(`/accounts/${accountId}/transactions${query}`);
  }

  /**
   * Trial Balance
   */
  async getTrialBalance(asOfDate?: string): Promise<any> {
    const query = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.request<any>(`/financial-statements/trial-balance${query}`);
  }
} 