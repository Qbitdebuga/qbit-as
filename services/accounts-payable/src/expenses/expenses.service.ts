import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesRepository } from './expenses.repository.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { ExpenseStatus } from './entities/expense.entity.js';

@Injectable()
export class ExpensesService {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async create(createExpenseDto: CreateExpenseDto) {
    return this.expensesRepository.create(createExpenseDto);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: ExpenseStatus;
    vendorId?: number;
    categoryId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      vendorId, 
      categoryId, 
      fromDate, 
      toDate, 
      search,
      sortBy = 'expenseDate',
      sortDirection = 'desc'
    } = query;

    // Build the where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (vendorId) {
      where.vendorId = parseInt(vendorId.toString());
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId.toString());
    }
    
    if (fromDate || toDate) {
      where.expenseDate = {};
      
      if (fromDate) {
        where.expenseDate.gte = new Date(fromDate);
      }
      
      if (toDate) {
        where.expenseDate.lte = new Date(toDate);
      }
    }
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { expenseNumber: { contains: search, mode: 'insensitive' } },
        { paymentReference: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build the orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortDirection;

    return this.expensesRepository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    const expense = await this.expensesRepository.findOne(id);
    
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    
    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id); // Ensure expense exists
    return this.expensesRepository.update(id, updateExpenseDto);
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure expense exists
    return this.expensesRepository.remove(id);
  }

  async updateStatus(id: number, status: ExpenseStatus) {
    await this.findOne(id); // Ensure expense exists
    return this.expensesRepository.updateStatus(id, status);
  }

  async findByVendor(vendorId: number) {
    return this.expensesRepository.findByVendor(vendorId);
  }

  async findByCategory(categoryId: number) {
    return this.expensesRepository.findByCategory(categoryId);
  }

  async addAttachment(expenseId: number, attachment: {
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
  }) {
    await this.findOne(expenseId); // Ensure expense exists
    return this.expensesRepository.addAttachment(expenseId, attachment);
  }

  async removeAttachment(id: number) {
    return this.expensesRepository.removeAttachment(id);
  }
} 