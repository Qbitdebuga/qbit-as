import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';
import { ExpensesRepository } from './expenses.repository.js';
import { ExpenseCategoriesController } from './expense-categories.controller.js';
import { ExpenseCategoriesService } from './expense-categories.service.js';
import { ExpenseCategoriesRepository } from './expense-categories.repository.js';

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