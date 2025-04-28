import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from './expense-category.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WIRE = 'WIRE',
  ACH = 'ACH',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER'
}

export class ExpenseAttachment {
  @ApiProperty({ example: 1, description: 'Unique identifier for the attachment' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the expense this attachment belongs to' })
  expenseId: number;

  @ApiProperty({ example: 'receipt.pdf', description: 'Name of the file' })
  fileName: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type of the file' })
  fileType: string;

  @ApiProperty({ example: 254879, description: 'Size of the file in bytes' })
  fileSize: number;

  @ApiProperty({ example: '/uploads/expenses/receipt.pdf', description: 'Path to the stored file' })
  filePath: string;

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the file was uploaded' })
  uploadedAt: Date;
}

export class ExpenseTag {
  @ApiProperty({ example: 1, description: 'Unique identifier for the tag' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the expense this tag belongs to' })
  expenseId: number;

  @ApiProperty({ example: 'Travel', description: 'Tag name' })
  name: string;
}

export class Expense {
  @ApiProperty({ example: 1, description: 'Unique identifier for the expense' })
  id: number;

  @ApiProperty({ example: 'EXP-00001', description: 'Unique expense number' })
  expenseNumber: string;

  @ApiPropertyOptional({ example: 1, description: 'ID of the expense category' })
  categoryId?: number;

  @ApiPropertyOptional({ description: 'The category this expense belongs to' })
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: 1, description: 'ID of the vendor associated with this expense' })
  vendorId?: number;

  @ApiPropertyOptional({ description: 'The vendor associated with this expense' })
  vendor?: Vendor;

  @ApiPropertyOptional({ example: 1, description: 'ID of the employee who incurred the expense' })
  employeeId?: number;

  @ApiProperty({ example: 'Office supplies', description: 'Description of the expense' })
  description: string;

  @ApiProperty({ example: 85.5, description: 'Amount before tax' })
  amount: number;

  @ApiPropertyOptional({ example: 14.5, description: 'Tax amount' })
  taxAmount?: number;

  @ApiProperty({ example: 100.0, description: 'Total amount including tax' })
  totalAmount: number;

  @ApiPropertyOptional({ example: 'https://storage.example.com/receipts/receipt-123.jpg', description: 'URL to the receipt image or file' })
  receiptUrl?: string;

  @ApiProperty({ example: '2023-01-15', description: 'Date the expense was incurred' })
  expenseDate: Date;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD, description: 'Method of payment used for the expense' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'CARD-4567', description: 'Reference to payment details' })
  paymentReference?: string;

  @ApiProperty({ enum: ExpenseStatus, example: ExpenseStatus.PENDING, description: 'Current status of the expense' })
  status: ExpenseStatus;

  @ApiPropertyOptional({ example: 'Monthly team lunch', description: 'Additional notes about the expense' })
  notes?: string;

  @ApiProperty({ example: false, description: 'Whether this expense is reimbursable' })
  isReimbursable: boolean;

  @ApiProperty({ example: false, description: 'Whether this expense has been reconciled' })
  isReconciled: boolean;

  @ApiPropertyOptional({ type: [ExpenseAttachment], description: 'Attachments related to this expense' })
  attachments?: ExpenseAttachment[];

  @ApiPropertyOptional({ type: [ExpenseTag], description: 'Tags associated with this expense' })
  tags?: ExpenseTag[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the expense was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the expense was last updated' })
  updatedAt: Date;
} 