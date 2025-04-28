import { Module } from '@nestjs/common';
import { FinancialStatementsController } from './financial-statements.controller.js';
import { FinancialStatementsService } from './financial-statements.service.js';
import { BalanceSheetGenerator } from './generators/balance-sheet.generator.js';
import { IncomeStatementGenerator } from './generators/income-statement.generator.js';
import { CashFlowGenerator } from './generators/cash-flow.generator.js';
import { PrismaModule } from '../prisma/prisma.module.js';

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