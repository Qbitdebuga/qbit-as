import { Controller, Post, Body, Get, Query, ParseBoolPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FinancialStatementsService } from './financial-statements.service';
import { StatementRequestDto } from './dto/statement-request.dto';
import { BalanceSheetStatementDto, IncomeStatementDto, CashFlowStatementDto, StatementPeriod } from '@qbit/shared-types';

@ApiTags('Financial Statements')
@Controller('financial-statements')
export class FinancialStatementsController {
  constructor(private readonly financialStatementsService: FinancialStatementsService) {}

  @Post('balance-sheet')
  @ApiOperation({ summary: 'Generate a balance sheet report' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance sheet report generated successfully',
    type: Object
  })
  async generateBalanceSheet(@Body() request: StatementRequestDto): Promise<BalanceSheetStatementDto> {
    return this.financialStatementsService.generateBalanceSheet(request);
  }

  @Post('income-statement')
  @ApiOperation({ summary: 'Generate an income statement report' })
  @ApiResponse({ 
    status: 200, 
    description: 'Income statement report generated successfully',
    type: Object
  })
  async generateIncomeStatement(@Body() request: StatementRequestDto): Promise<IncomeStatementDto> {
    return this.financialStatementsService.generateIncomeStatement(request);
  }

  @Post('cash-flow')
  @ApiOperation({ summary: 'Generate a cash flow statement report' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cash flow statement report generated successfully',
    type: Object
  })
  async generateCashFlowStatement(@Body() request: StatementRequestDto): Promise<CashFlowStatementDto> {
    return this.financialStatementsService.generateCashFlowStatement(request);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get a balance sheet report using query parameters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance sheet report generated successfully',
    type: Object
  })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'period', enum: StatementPeriod, required: true })
  @ApiQuery({ name: 'comparativePeriod', required: false, type: Boolean })
  @ApiQuery({ name: 'includeZeroBalances', required: false, type: Boolean })
  async getBalanceSheet(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: StatementPeriod,
    @Query('comparativePeriod', new DefaultValuePipe(false), ParseBoolPipe) comparativePeriod: boolean,
    @Query('includeZeroBalances', new DefaultValuePipe(false), ParseBoolPipe) includeZeroBalances: boolean,
  ): Promise<BalanceSheetStatementDto> {
    const request: StatementRequestDto = {
      startDate,
      endDate,
      period,
      comparativePeriod,
      includeZeroBalances,
    };
    return this.financialStatementsService.generateBalanceSheet(request);
  }

  @Get('income-statement')
  @ApiOperation({ summary: 'Get an income statement report using query parameters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Income statement report generated successfully',
    type: Object
  })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'period', enum: StatementPeriod, required: true })
  @ApiQuery({ name: 'comparativePeriod', required: false, type: Boolean })
  @ApiQuery({ name: 'includeZeroBalances', required: false, type: Boolean })
  async getIncomeStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: StatementPeriod,
    @Query('comparativePeriod', new DefaultValuePipe(false), ParseBoolPipe) comparativePeriod: boolean,
    @Query('includeZeroBalances', new DefaultValuePipe(false), ParseBoolPipe) includeZeroBalances: boolean,
  ): Promise<IncomeStatementDto> {
    const request: StatementRequestDto = {
      startDate,
      endDate,
      period,
      comparativePeriod,
      includeZeroBalances,
    };
    return this.financialStatementsService.generateIncomeStatement(request);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get a cash flow statement report using query parameters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cash flow statement report generated successfully',
    type: Object
  })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'period', enum: StatementPeriod, required: true })
  @ApiQuery({ name: 'comparativePeriod', required: false, type: Boolean })
  async getCashFlowStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: StatementPeriod,
    @Query('comparativePeriod', new DefaultValuePipe(false), ParseBoolPipe) comparativePeriod: boolean,
  ): Promise<CashFlowStatementDto> {
    const request: StatementRequestDto = {
      startDate,
      endDate,
      period,
      comparativePeriod,
      includeZeroBalances: false,
    };
    return this.financialStatementsService.generateCashFlowStatement(request);
  }
} 