import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ExpenseCategoriesRepository } from './expense-categories.repository';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly expenseCategoriesRepository: ExpenseCategoriesRepository) {}

  async create(createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.expenseCategoriesRepository.create(createExpenseCategoryDto);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }) {
    const { 
      page = 1, 
      limit = 10, 
      isActive, 
      search 
    } = query;

    // Build the where clause
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.expenseCategoriesRepository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.expenseCategoriesRepository.findOne(id);
    
    if (!category) {
      throw new NotFoundException(`Expense category with ID ${id} not found`);
    }
    
    return category;
  }

  async update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    await this.findOne(id); // Ensure category exists
    return this.expenseCategoriesRepository.update(id, updateExpenseCategoryDto);
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure category exists
    
    try {
      return await this.expenseCategoriesRepository.remove(id);
    } catch (error) {
      // If there's a foreign key constraint (expenses using this category)
      if (error.code === 'P2003') {
        throw new ConflictException('This category has expenses associated with it and cannot be deleted.');
      }
      throw error;
    }
  }

  async findActive() {
    return this.expenseCategoriesRepository.findActive();
  }
} 