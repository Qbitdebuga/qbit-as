import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expense } from './expense.entity';

export class ExpenseCategory {
  @ApiProperty({ example: 1, description: 'Unique identifier for the expense category' })
  id: number | null;

  @ApiProperty({ example: 'Office Supplies', description: 'Name of the expense category' })
  name: string | null;

  @ApiPropertyOptional({ example: 'Expenses related to office supplies and stationery', description: 'Description of the expense category' })
  description?: string | null;

  @ApiPropertyOptional({ example: 5001, description: 'ID of the accounting system account associated with this category' })
  accountId?: number | null;

  @ApiProperty({ example: true, description: 'Whether this category is active' })
  isActive: boolean | null;

  @ApiPropertyOptional({ type: [Expense], description: 'Expenses in this category' })
  expenses?: Expense[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the category was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the category was last updated' })
  updatedAt: Date;
} 