import { Module } from '@nestjs/common';
import { FinancialStatementsController } from './financial-statements.controller';
import { FinancialStatementsService } from './financial-statements.service';
import { BalanceSheetGenerator } from './generators/balance-sheet.generator';
import { IncomeStatementGenerator } from './generators/income-statement.generator';
import { CashFlowGenerator } from './generators/cash-flow.generator';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialStatementsController],
  providers: [
    FinancialStatementsService,
    BalanceSheetGenerator,
    IncomeStatementGenerator,
    CashFlowGenerator,
  ],
  exports: [FinancialStatementsService],
})
export class FinancialStatementsModule {} 