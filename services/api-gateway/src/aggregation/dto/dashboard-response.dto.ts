import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];
}

export class BalanceSheetSummary {
  @ApiProperty({ description: 'Total assets' })
  totalAssets: number;

  @ApiProperty({ description: 'Total liabilities' })
  totalLiabilities: number;

  @ApiProperty({ description: 'Total equity' })
  equity: number;
}

export class IncomeStatementSummary {
  @ApiProperty({ description: 'Total revenue' })
  revenue: number;

  @ApiProperty({ description: 'Total expenses' })
  expenses: number;

  @ApiProperty({ description: 'Net income' })
  netIncome: number;
}

export class FinancialSummary {
  @ApiProperty({ description: 'Total number of accounts' })
  totalAccounts: number;

  @ApiProperty({ description: 'Recent journal entry transactions', type: 'array' })
  recentTransactions: any[];

  @ApiProperty({ type: BalanceSheetSummary })
  balanceSheet: BalanceSheetSummary;

  @ApiProperty({ type: IncomeStatementSummary })
  incomeStatement: IncomeStatementSummary;
}

export class DashboardResponseDto {
  @ApiProperty({ type: UserInfo })
  user: UserInfo;

  @ApiProperty({ type: FinancialSummary })
  financialSummary: FinancialSummary;
} 