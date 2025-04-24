import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceStatus } from './invoice-status.enum';
import { InvoicePayment } from './invoice-payment.entity';

export class Invoice {
  @ApiProperty({ description: 'Unique identifier', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'Invoice number', example: 'INV-00001' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Customer ID', example: 'c7fb7b8a-b35d-4d5f-a766-78364b5ac1ff' })
  customerId: string;

  @ApiPropertyOptional({ description: 'Customer reference number', example: 'PO-12345' })
  customerReference?: string;

  @ApiProperty({ description: 'Invoice date', example: '2023-01-15' })
  invoiceDate: Date;

  @ApiProperty({ description: 'Due date', example: '2023-02-15' })
  dueDate: Date;

  @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus, example: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Subtotal amount (before tax)', example: 1000.00 })
  subtotal: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 100.00 })
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 50.00 })
  discountAmount?: number;

  @ApiProperty({ description: 'Total amount', example: 1050.00 })
  totalAmount: number;

  @ApiProperty({ description: 'Amount paid', example: 0.00, default: 0 })
  amountPaid: number;

  @ApiProperty({ description: 'Balance due', example: 1050.00 })
  balanceDue: number;

  @ApiPropertyOptional({ description: 'Notes', example: 'Payment due within 30 days' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  terms?: string;

  @ApiPropertyOptional({ description: 'Invoice items', type: [InvoiceItem] })
  items?: InvoiceItem[];

  @ApiPropertyOptional({ description: 'Invoice payments', type: [InvoicePayment] })
  payments?: InvoicePayment[];

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;
} 