import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Bill } from '../../bills/entities/bill.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  VOIDED = 'VOIDED',
}

export class PaymentApplication {
  @ApiProperty({ example: 1, description: 'Unique identifier for the payment application' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the payment this application belongs to' })
  paymentId: number;

  @ApiProperty({ example: 1, description: 'ID of the bill this payment is applied to' })
  billId: number;

  @ApiProperty({ example: 500.00, description: 'Amount applied to the bill from this payment' })
  amount: number;
  
  @ApiProperty({ description: 'The bill this payment is applied to' })
  bill?: Bill;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class Payment {
  @ApiProperty({ example: 1, description: 'Unique identifier for the payment' })
  id: number;

  @ApiProperty({ example: 'PAY-00001', description: 'Unique payment number' })
  paymentNumber: string;

  @ApiProperty({ example: 1, description: 'ID of the vendor the payment is for' })
  vendorId: number;

  @ApiProperty({ description: 'The vendor the payment is for' })
  vendor?: Vendor;

  @ApiProperty({ example: '2023-01-15', description: 'Date the payment was made' })
  paymentDate: Date;

  @ApiProperty({ example: 1000.00, description: 'Total amount of the payment' })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER, description: 'Method of payment' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'REF123456', description: 'Reference number or identifier for the payment', required: false })
  reference?: string;

  @ApiProperty({ example: 'Payment for January invoices', description: 'Optional memo or notes about the payment', required: false })
  memo?: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED, description: 'Current status of the payment' })
  status: PaymentStatus;

  @ApiProperty({ example: 1, description: 'ID of the bank account from which the payment was made', required: false })
  bankAccountId?: number;

  @ApiProperty({ type: [PaymentApplication], description: 'Applications of this payment to bills' })
  applications?: PaymentApplication[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 