import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillLineItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Unique identifier for the bill line item',
  })
  id: string | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the bill this line item belongs to',
  })
  billId: string | null;

  @ApiProperty({
    example: 'Professional Services',
    description: 'Description of the item or service',
  })
  description: string | null;

  @ApiProperty({
    example: 1,
    description: 'Quantity of items',
  })
  quantity: number | null;

  @ApiProperty({
    example: 500.00,
    description: 'Unit price of the item',
  })
  unitPrice: number | null;

  @ApiProperty({
    example: 500.00,
    description: 'Total amount for this line item',
  })
  amount: number | null;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'ID of the account to which this expense is allocated',
  })
  accountId?: string | null;

  @ApiPropertyOptional({
    example: 'IT-EXP',
    description: 'Account code for this line item',
  })
  accountCode?: string | null;

  @ApiPropertyOptional({
    example: 10.00,
    description: 'Tax rate applied to this line item (percentage)',
  })
  taxRate?: number | null;

  @ApiPropertyOptional({
    example: 50.00,
    description: 'Tax amount for this line item',
  })
  taxAmount?: number | null;

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the line item was created',
  })
  createdAt: string | null;

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the line item was last updated',
  })
  updatedAt: string | null;
} 