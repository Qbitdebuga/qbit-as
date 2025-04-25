import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: {
        name: data.name,
        description: data.description,
        accountId: data.accountId,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Record<string, any>;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          expenses: {
            take: 5,
            orderBy: { expenseDate: 'desc' },
          },
        },
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOne(id: number) {
    return this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: {
          take: 10,
          orderBy: { expenseDate: 'desc' },
        },
      },
    });
  }

  async update(id: number, data: UpdateExpenseCategoryDto) {
    return this.prisma.expenseCategory.update({
      where: { id },
      data,
      include: {
        expenses: {
          take: 10,
          orderBy: { expenseDate: 'desc' },
        },
      },
    });
  }

  async remove(id: number) {
    // First check if there are any expenses using this category
    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });

    if (expenseCount > 0) {
      // If expenses exist, just mark the category as inactive instead of deleting
      return this.prisma.expenseCategory.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Otherwise, delete the category
    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }

  async findActive() {
    return this.prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
} 