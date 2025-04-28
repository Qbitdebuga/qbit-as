import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty({ description: 'User ID' })
  id!: string | null;

  @ApiProperty({ description: 'User name' })
  name!: string | null;

  @ApiProperty({ description: 'User email' })
  email!: string | null;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles!: string[];
}

export class BalanceSheetSummary {
  @ApiProperty({ description: 'Total assets' })
  totalAssets!: number | null;

  @ApiProperty({ description: 'Total liabilities' })
  totalLiabilities!: number | null;

  @ApiProperty({ description: 'Total equity' })
  equity!: number | null;
}

export class IncomeStatementSummary {
  @ApiProperty({ description: 'Total revenue' })
  revenue!: number | null;

  @ApiProperty({ description: 'Total expenses' })
  expenses!: number | null;

  @ApiProperty({ description: 'Net income' })
  netIncome!: number | null;
}

export class FinancialSummary {
  @ApiProperty({ description: 'Total number of accounts' })
  totalAccounts!: number | null;

  @ApiProperty({ description: 'Recent journal entry transactions', type: 'array' })
  recentTransactions!: any[];

  @ApiProperty({ type: BalanceSheetSummary })
  balanceSheet!: BalanceSheetSummary;

  @ApiProperty({ type: IncomeStatementSummary })
  incomeStatement!: IncomeStatementSummary;
}

export class DashboardResponseDto {
  @ApiProperty({ type: UserInfo })
  user!: UserInfo;

  @ApiProperty({ type: FinancialSummary })
  financialSummary!: FinancialSummary;
} 