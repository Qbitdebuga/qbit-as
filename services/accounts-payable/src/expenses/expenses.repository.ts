import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto, CreateExpenseTagDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseStatus } from './entities/expense.entity';

@Injectable()
export class ExpensesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateExpenseDto) {
    // Generate expense number if not provided
    if (!data.expenseNumber) {
      const lastExpense = await this?.prisma.expense.findFirst({
        orderBy: { id: 'desc' },
      });

      const nextNumber = lastExpense ? parseInt(lastExpense?.expenseNumber.split('-')[1]) + 1 : 1;
      data.expenseNumber = `EXP-${nextNumber.toString().padStart(5, '0')}`;
    }

    // Extract tags from the data
    const { tags, ...expenseData } = data;

    // Create expense with nested tags
    return this?.prisma.expense.create({
      data: {
        ...expenseData,
        status: data.status || ExpenseStatus.PENDING,
        isReimbursable: data.isReimbursable ?? false,
        isReconciled: data.isReconciled ?? false,
        tags: tags
          ? {
              create: tags.map((tag) => ({
                name: tag.name,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        vendor: true,
        tags: true,
        attachments: true,
      },
    });
  }

  async findAll(params: {
    skip?: number | null;
    take?: number | null;
    cursor?: Record<string, any>;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }) {
    const { skip, take, cursor, where, orderBy } = params;

    const [data, total] = await Promise.all([
      this?.prisma.expense.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          category: true,
          vendor: true,
          tags: true,
          attachments: true,
        },
      }),
      this?.prisma.expense.count({ where }),
    ]);

    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOne(id: number) {
    return this?.prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        tags: true,
        attachments: true,
      },
    });
  }

  async update(id: number, data: UpdateExpenseDto) {
    const { tags, ...updateData } = data;

    // First update the expense
    const updatedExpense = await this?.prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        vendor: true,
        tags: true,
        attachments: true,
      },
    });

    // If tags are provided, update them
    if (tags) {
      // Delete existing tags
      await this?.prisma.expenseTag.deleteMany({
        where: { expenseId: id },
      });

      // Create new tags
      if (tags.length > 0) {
        await this?.prisma.expenseTag.createMany({
          data: tags.map((tag) => ({
            expenseId: id,
            name: tag.name,
          })),
        });
      }

      // Fetch updated expense with new tags
      return this.findOne(id);
    }

    return updatedExpense;
  }

  async remove(id: number) {
    return this?.prisma.expense.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: ExpenseStatus) {
    return this?.prisma.expense.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        vendor: true,
        tags: true,
        attachments: true,
      },
    });
  }

  async findByVendor(vendorId: number) {
    return this?.prisma.expense.findMany({
      where: { vendorId },
      include: {
        category: true,
        tags: true,
        attachments: true,
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async findByCategory(categoryId: number) {
    return this?.prisma.expense.findMany({
      where: { categoryId },
      include: {
        vendor: true,
        tags: true,
        attachments: true,
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async findByStatus(status: ExpenseStatus) {
    return this?.prisma.expense.findMany({
      where: { status },
      include: {
        category: true,
        vendor: true,
        tags: true,
        attachments: true,
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async addAttachment(
    expenseId: number,
    attachment: {
      fileName: string | null;
      fileType: string | null;
      fileSize: number | null;
      filePath: string | null;
    },
  ) {
    return this?.prisma.expenseAttachment.create({
      data: {
        expenseId,
        ...attachment,
      },
    });
  }

  async removeAttachment(id: number) {
    return this?.prisma.expenseAttachment.delete({
      where: { id },
    });
  }
}
