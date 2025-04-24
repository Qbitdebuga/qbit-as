import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpensesRepository } from './expenses.repository';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesRepository } from './expense-categories.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ExpensesController, ExpenseCategoriesController],
  providers: [
    ExpensesService, 
    ExpensesRepository,
    ExpenseCategoriesService,
    ExpenseCategoriesRepository
  ],
  exports: [ExpensesService, ExpenseCategoriesService]
})
export class ExpensesModule {} 