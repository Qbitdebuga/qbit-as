import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillLineItemDto } from './bill-line-item.dto.js';
import { BillStatus } from './bill-status.enum.js';

export class BillDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the bill',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the vendor the bill is from',
  })
  vendorId: string;

  @ApiPropertyOptional({
    example: 'Acme Supplies',
    description: 'Name of the vendor',
  })
  vendorName?: string;

  @ApiProperty({
    example: 'INV-12345',
    description: 'Invoice number from the vendor',
  })
  invoiceNumber: string;

  @ApiProperty({
    example: '2023-05-01',
    description: 'Date the bill was issued',
  })
  issueDate: string;

  @ApiProperty({
    example: '2023-05-31',
    description: 'Date the bill is due',
  })
  dueDate: string;

  @ApiProperty({
    example: BillStatus.PENDING,
    description: 'Current status of the bill',
    enum: BillStatus,
  })
  status: BillStatus;

  @ApiProperty({
    example: 1000.00,
    description: 'Subtotal amount before taxes',
  })
  subtotal: number;

  @ApiProperty({
    example: 100.00,
    description: 'Total tax amount',
  })
  taxTotal: number;

  @ApiProperty({
    example: 1100.00,
    description: 'Total amount including taxes',
  })
  total: number;

  @ApiProperty({
    example: 500.00,
    description: 'Amount paid so far',
  })
  amountPaid: number;

  @ApiProperty({
    example: 600.00,
    description: 'Remaining balance due',
  })
  balanceDue: number;

  @ApiPropertyOptional({
    example: 'Net 30 payment terms',
    description: 'Additional notes about the bill',
  })
  notes?: string;

  @ApiProperty({
    type: [BillLineItemDto],
    description: 'Line items included in this bill',
  })
  lineItems: BillLineItemDto[];

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the bill was created',
  })
  createdAt: string;

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the bill was last updated',
  })
  updatedAt: string;
} 