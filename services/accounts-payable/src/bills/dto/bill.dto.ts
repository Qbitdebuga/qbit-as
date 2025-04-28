import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillLineItemDto } from './bill-line-item.dto';
import { BillStatus } from './bill-status.enum';

export class BillDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the bill',
  })
  id: string | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the vendor the bill is from',
  })
  vendorId: string | null;

  @ApiPropertyOptional({
    example: 'Acme Supplies',
    description: 'Name of the vendor',
  })
  vendorName?: string | null;

  @ApiProperty({
    example: 'INV-12345',
    description: 'Invoice number from the vendor',
  })
  invoiceNumber: string | null;

  @ApiProperty({
    example: '2023-05-01',
    description: 'Date the bill was issued',
  })
  issueDate: string | null;

  @ApiProperty({
    example: '2023-05-31',
    description: 'Date the bill is due',
  })
  dueDate: string | null;

  @ApiProperty({
    example: BillStatus.PENDING,
    description: 'Current status of the bill',
    enum: BillStatus,
  })
  status: BillStatus;

  @ApiProperty({
    example: 1000.0,
    description: 'Subtotal amount before taxes',
  })
  subtotal: number | null;

  @ApiProperty({
    example: 100.0,
    description: 'Total tax amount',
  })
  taxTotal: number | null;

  @ApiProperty({
    example: 1100.0,
    description: 'Total amount including taxes',
  })
  total: number | null;

  @ApiProperty({
    example: 500.0,
    description: 'Amount paid so far',
  })
  amountPaid: number | null;

  @ApiProperty({
    example: 600.0,
    description: 'Remaining balance due',
  })
  balanceDue: number | null;

  @ApiPropertyOptional({
    example: 'Net 30 payment terms',
    description: 'Additional notes about the bill',
  })
  notes?: string | null;

  @ApiProperty({
    type: [BillLineItemDto],
    description: 'Line items included in this bill',
  })
  lineItems: BillLineItemDto[];

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the bill was created',
  })
  createdAt: string | null;

  @ApiProperty({
    example: '2023-05-01T00:00:00.000Z',
    description: 'Date and time when the bill was last updated',
  })
  updatedAt: string | null;
}
