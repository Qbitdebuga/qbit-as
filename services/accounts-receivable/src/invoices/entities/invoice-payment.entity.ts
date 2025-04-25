import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from './payment-method.enum';
import { PaymentStatus } from './payment-status.enum';

export class InvoicePayment {
  @ApiProperty({ description: 'Unique identifier', example: 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7' })
  id!: string;

  @ApiProperty({ description: 'Invoice ID', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  invoiceId!: string;

  @ApiProperty({ description: 'Payment date', example: '2023-02-10T00:00:00.000Z' })
  paymentDate!: Date;

  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  amount!: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  paymentMethod!: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  status!: PaymentStatus;

  @ApiPropertyOptional({ description: 'Reference/transaction number', example: 'TRX-123456' })
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt!: Date;
} 