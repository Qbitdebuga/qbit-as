import { ApiClient } from '../api-client';
import { 
  BalanceSheetStatementDto,
  IncomeStatementDto,
  CashFlowStatementDto,
  StatementPeriod,
  StatementRequestDto
} from '@qbit/shared-types';

export class ReportsClient {
  private client: ApiClient;
  private baseUrl: string;

  constructor(client: ApiClient) {
    this.client = client;
    this.baseUrl = '/general-ledger/financial-statements';
  }

  /**
   * Get a balance sheet report
   */
  async getBalanceSheet(
    startDate: string,
    endDate: string,
    period: StatementPeriod,
    comparativePeriod: boolean = false,
    includeZeroBalances: boolean = false
  ): Promise<BalanceSheetStatementDto> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      period,
      comparativePeriod: comparativePeriod.toString(),
      includeZeroBalances: includeZeroBalances.toString()
    });
    
    return this.client.get<BalanceSheetStatementDto>(`${this.baseUrl}/balance-sheet?${params.toString()}`);
  }

  /**
   * Generate a balance sheet report with request body
   */
  async generateBalanceSheet(data: StatementRequestDto): Promise<BalanceSheetStatementDto> {
    return this.client.post<BalanceSheetStatementDto>(`${this.baseUrl}/balance-sheet`, data);
  }

  /**
   * Get an income statement report
   */
  async getIncomeStatement(
    startDate: string,
    endDate: string,
    period: StatementPeriod,
    comparativePeriod: boolean = false,
    includeZeroBalances: boolean = false
  ): Promise<IncomeStatementDto> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      period,
      comparativePeriod: comparativePeriod.toString(),
      includeZeroBalances: includeZeroBalances.toString()
    });
    
    return this.client.get<IncomeStatementDto>(`${this.baseUrl}/income-statement?${params.toString()}`);
  }

  /**
   * Generate an income statement report with request body
   */
  async generateIncomeStatement(data: StatementRequestDto): Promise<IncomeStatementDto> {
    return this.client.post<IncomeStatementDto>(`${this.baseUrl}/income-statement`, data);
  }

  /**
   * Get a cash flow statement report
   */
  async getCashFlowStatement(
    startDate: string,
    endDate: string,
    period: StatementPeriod,
    comparativePeriod: boolean = false
  ): Promise<CashFlowStatementDto> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      period,
      comparativePeriod: comparativePeriod.toString()
    });
    
    return this.client.get<CashFlowStatementDto>(`${this.baseUrl}/cash-flow?${params.toString()}`);
  }

  /**
   * Generate a cash flow statement report with request body
   */
  async generateCashFlowStatement(data: StatementRequestDto): Promise<CashFlowStatementDto> {
    return this.client.post<CashFlowStatementDto>(`${this.baseUrl}/cash-flow`, data);
  }
} 