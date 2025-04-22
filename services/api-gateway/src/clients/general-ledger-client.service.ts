import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AuthClientService } from './auth-client.service';

@Injectable()
export class GeneralLedgerClientService {
  private readonly logger = new Logger(GeneralLedgerClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authClient: AuthClientService
  ) {
    this.serviceUrl = this.configService.get<string>('GENERAL_LEDGER_SERVICE_URL');
    this.apiKey = this.configService.get<string>('GENERAL_LEDGER_SERVICE_API_KEY');

    if (!this.serviceUrl) {
      this.logger.error('GENERAL_LEDGER_SERVICE_URL not configured');
      throw new Error('General Ledger service URL not configured');
    }

    this.httpClient = axios.create({
      baseURL: this.serviceUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    this.logger.log(`General Ledger client initialized with URL: ${this.serviceUrl}`);
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<any[]> {
    try {
      // Get a service token with the right scope for GL access
      const serviceToken = await this.authClient.getServiceToken(['gl:read']);
      
      const response = await this.httpClient.get('/accounts', {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get accounts: ${error.message}`, error.stack);
      throw new Error(`Failed to get accounts: ${error.message}`);
    }
  }

  /**
   * Get an account by ID
   */
  async getAccountById(accountId: string): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['gl:read']);
      
      const response = await this.httpClient.get(`/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get account: ${error.message}`, error.stack);
      throw new Error(`Failed to get account: ${error.message}`);
    }
  }

  /**
   * Get all journal entries with optional pagination
   */
  async getJournalEntries(page = 1, limit = 20): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['gl:read']);
      
      const response = await this.httpClient.get('/journal-entries', {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get journal entries: ${error.message}`, error.stack);
      throw new Error(`Failed to get journal entries: ${error.message}`);
    }
  }

  /**
   * Get a journal entry by ID
   */
  async getJournalEntryById(journalEntryId: string): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['gl:read']);
      
      const response = await this.httpClient.get(`/journal-entries/${journalEntryId}`, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get journal entry: ${error.message}`, error.stack);
      throw new Error(`Failed to get journal entry: ${error.message}`);
    }
  }

  /**
   * Create a new journal entry
   */
  async createJournalEntry(journalEntryData: any): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['gl:write']);
      
      const response = await this.httpClient.post('/journal-entries', journalEntryData, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create journal entry: ${error.message}`, error.stack);
      throw new Error(`Failed to create journal entry: ${error.message}`);
    }
  }

  /**
   * Get a financial statement
   */
  async getFinancialStatement(type: 'balance-sheet' | 'income-statement' | 'cash-flow', params: any): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['gl:read']);
      
      const response = await this.httpClient.get(`/financial-statements/${type}`, {
        params,
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get ${type}: ${error.message}`, error.stack);
      throw new Error(`Failed to get ${type}: ${error.message}`);
    }
  }
} 