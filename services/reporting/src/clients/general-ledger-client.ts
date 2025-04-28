import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { AuthClientService } from './auth-client';
import {
  AccountDto,
  JournalEntryDto,
  FinancialStatementDto,
  StatementRequestDto,
} from '../dto/general-ledger.dto';

@Injectable()
export class GeneralLedgerClientService {
  private readonly logger = new Logger(GeneralLedgerClientService.name);
  private readonly generalLedgerServiceUrl: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authClientService: AuthClientService,
  ) {
    this.generalLedgerServiceUrl = this?.configService.get<string>('GENERAL_LEDGER_SERVICE_URL');
    if (!this.generalLedgerServiceUrl) {
      this?.logger.error('GENERAL_LEDGER_SERVICE_URL is not defined in environment variables');
      throw new Error('GENERAL_LEDGER_SERVICE_URL is not defined');
    }
  }

  /**
   * Make an authenticated request to the General Ledger service
   */
  private async makeAuthenticatedRequest<T>(
    url: string,
    method: string,
    data?: any,
    config?: AxiosRequestConfig,
    requiredScopes: string[] = ['general-ledger:read'],
  ): Promise<T> {
    try {
      // Get a service token from the Auth service
      const token = await this?.authClientService.fetchServiceToken();

      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (method === 'GET') {
        response = await firstValueFrom(this?.httpService.get(url, requestConfig));
      } else if (method === 'POST') {
        response = await firstValueFrom(this?.httpService.post(url, data, requestConfig));
      } else if (method === 'PUT') {
        response = await firstValueFrom(this?.httpService.put(url, data, requestConfig));
      } else if (method === 'DELETE') {
        response = await firstValueFrom(this?.httpService.delete(url, requestConfig));
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      this?.logger.error(`Request to General Ledger service failed: ${error.message}`, error.stack);
      throw new Error(`Request to General Ledger service failed: ${error.message}`);
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<AccountDto[]> {
    try {
      return this.makeAuthenticatedRequest<AccountDto[]>(
        `${this.generalLedgerServiceUrl}/accounts`,
        'GET',
      );
    } catch (error) {
      this?.logger.error(`Failed to get accounts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string): Promise<AccountDto> {
    try {
      return this.makeAuthenticatedRequest<AccountDto>(
        `${this.generalLedgerServiceUrl}/accounts/${accountId}`,
        'GET',
      );
    } catch (error) {
      this?.logger.error(`Failed to get account by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get journal entries with pagination
   */
  async getJournalEntries(page = 1, limit = 20): Promise<{ data: JournalEntryDto[]; meta: any }> {
    try {
      return this.makeAuthenticatedRequest<{ data: JournalEntryDto[]; meta: any }>(
        `${this.generalLedgerServiceUrl}/journal-entries?page=${page}&limit=${limit}`,
        'GET',
      );
    } catch (error) {
      this?.logger.error(`Failed to get journal entries: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(journalEntryId: string): Promise<JournalEntryDto> {
    try {
      return this.makeAuthenticatedRequest<JournalEntryDto>(
        `${this.generalLedgerServiceUrl}/journal-entries/${journalEntryId}`,
        'GET',
      );
    } catch (error) {
      this?.logger.error(`Failed to get journal entry by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get financial statement
   */
  async getFinancialStatement(
    type: string,
    request: StatementRequestDto,
  ): Promise<FinancialStatementDto> {
    try {
      return this.makeAuthenticatedRequest<FinancialStatementDto>(
        `${this.generalLedgerServiceUrl}/financial-statements/${type}`,
        'POST',
        request,
      );
    } catch (error) {
      this?.logger.error(`Failed to get financial statement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get trial balance
   */
  async getTrialBalance(asOfDate?: string): Promise<any> {
    try {
      const url = asOfDate
        ? `${this.generalLedgerServiceUrl}/financial-statements/trial-balance?asOfDate=${asOfDate}`
        : `${this.generalLedgerServiceUrl}/financial-statements/trial-balance`;

      return this.makeAuthenticatedRequest<any>(url, 'GET');
    } catch (error) {
      this?.logger.error(`Failed to get trial balance: ${error.message}`, error.stack);
      throw error;
    }
  }
}
