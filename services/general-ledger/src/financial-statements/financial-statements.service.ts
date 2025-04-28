import { Injectable, Logger } from '@nestjs/common';
import { 
  BalanceSheetStatementDto,
  IncomeStatementDto, 
  CashFlowStatementDto,
  StatementPeriod 
} from '@qbit/shared-types';
import { BalanceSheetGenerator } from './generators/balance-sheet.generator';
import { IncomeStatementGenerator } from './generators/income-statement.generator';
import { CashFlowGenerator } from './generators/cash-flow.generator';
import { StatementRequestDto } from './dto/statement-request.dto';
import { format } from 'date-fns';

@Injectable()
export class FinancialStatementsService {
  private readonly logger = new Logger(FinancialStatementsService.name);

  constructor(
    private readonly balanceSheetGenerator: BalanceSheetGenerator,
    private readonly incomeStatementGenerator: IncomeStatementGenerator,
    private readonly cashFlowGenerator: CashFlowGenerator,
  ) {}

  async generateBalanceSheet(request: StatementRequestDto): Promise<BalanceSheetStatementDto> {
    this?.logger.log(`Generating balance sheet report from ${request.startDate} to ${request.endDate}`);
    const balanceSheetData = await this?.balanceSheetGenerator.generate(
      request.startDate,
      request.endDate,
      request.comparativePeriod,
      request.includeZeroBalances,
    );

    return {
      meta: {
        title: 'Balance Sheet',
        reportType: 'BALANCE_SHEET',
        startDate: request.startDate,
        endDate: request.endDate,
        generatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        period: request.period,
        comparativePeriod: request.comparativePeriod,
      },
      data: balanceSheetData,
    };
  }

  async generateIncomeStatement(request: StatementRequestDto): Promise<IncomeStatementDto> {
    this?.logger.log(`Generating income statement report from ${request.startDate} to ${request.endDate}`);
    const incomeStatementData = await this?.incomeStatementGenerator.generate(
      request.startDate,
      request.endDate,
      request.comparativePeriod,
      request.includeZeroBalances,
    );

    return {
      meta: {
        title: 'Income Statement',
        reportType: 'INCOME_STATEMENT',
        startDate: request.startDate,
        endDate: request.endDate,
        generatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        period: request.period,
        comparativePeriod: request.comparativePeriod,
      },
      data: incomeStatementData,
    };
  }

  async generateCashFlowStatement(request: StatementRequestDto): Promise<CashFlowStatementDto> {
    this?.logger.log(`Generating cash flow statement report from ${request.startDate} to ${request.endDate}`);
    const cashFlowData = await this?.cashFlowGenerator.generate(
      request.startDate,
      request.endDate,
      request.comparativePeriod,
    );

    return {
      meta: {
        title: 'Cash Flow Statement',
        reportType: 'CASH_FLOW_STATEMENT',
        startDate: request.startDate,
        endDate: request.endDate,
        generatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        period: request.period,
        comparativePeriod: request.comparativePeriod,
      },
      data: cashFlowData,
    };
  }

  async getComparativePeriodDates(
    startDate: string,
    endDate: string,
    period: StatementPeriod,
  ): Promise<{ startDate: string | null; endDate: string }> {
    // Calculate previous period dates based on the current period
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Create new dates for the previous period
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays);
    
    return {
      startDate: format(prevStart, 'yyyy-MM-dd'),
      endDate: format(prevEnd, 'yyyy-MM-dd'),
    };
  }
} 