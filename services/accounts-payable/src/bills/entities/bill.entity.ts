import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { PaymentApplication } from '../../payments/entities/payment.entity';
import { BillStatus } from './bill-status.enum';

export class BillLineItem {
  @ApiProperty({ example: 1, description: 'Unique identifier for the line item' })
  id: number | null;

  @ApiProperty({ example: 1, description: 'ID of the bill this line item belongs to' })
  billId: number | null;

  @ApiProperty({
    example: 'Professional services',
    description: 'Description of the item or service',
  })
  description: string | null;

  @ApiProperty({ example: 1, description: 'Account ID to associate this line item with' })
  accountId?: number | null;

  @ApiProperty({ example: '5000', description: 'Account code for reference' })
  accountCode?: string | null;

  @ApiProperty({ example: 2, description: 'Quantity of items' })
  quantity: number | null;

  @ApiProperty({ example: 100.0, description: 'Price per unit' })
  unitPrice: number | null;

  @ApiProperty({
    example: 200.0,
    description: 'Total amount for this line item (quantity × unitPrice)',
  })
  amount: number | null;

  @ApiProperty({ example: 0.1, description: 'Tax rate applied to this item (if applicable)' })
  taxRate?: number | null;

  @ApiProperty({ example: 20.0, description: 'Tax amount for this line item' })
  taxAmount?: number | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class Bill {
  @ApiProperty({ example: 1, description: 'Unique identifier for the bill' })
  id: number | null;

  @ApiProperty({ example: 'BILL-00001', description: 'Unique bill number' })
  billNumber: string | null;

  @ApiProperty({ example: 1, description: 'ID of the vendor this bill is from' })
  vendorId: number | null;

  @ApiProperty({ description: 'The vendor this bill is from' })
  vendor?: Vendor;

  @ApiProperty({ example: 'INV-12345', description: "Vendor's invoice number" })
  invoiceNumber: string | null;

  @ApiProperty({ example: '2023-01-01', description: 'Date the bill was issued' })
  issueDate: Date;

  @ApiProperty({ example: '2023-02-01', description: 'Date payment is due' })
  dueDate: Date;

  @ApiProperty({
    enum: BillStatus,
    example: BillStatus.PENDING,
    description: 'Current status of the bill',
  })
  status: BillStatus;

  @ApiProperty({ example: 900.0, description: 'Subtotal amount before taxes' })
  subtotal: number | null;

  @ApiProperty({ example: 100.0, description: 'Total tax amount' })
  taxTotal: number | null;

  @ApiProperty({ example: 1000.0, description: 'Total amount including taxes' })
  total: number | null;

  @ApiProperty({ example: 500.0, description: 'Amount that has been paid' })
  amountPaid: number | null;

  @ApiProperty({ example: 500.0, description: 'Remaining balance due' })
  balanceDue: number | null;

  @ApiProperty({
    example: 'Monthly service charges',
    description: 'Additional notes about the bill',
  })
  notes?: string | null;

  @ApiProperty({ type: [BillLineItem], description: 'Line items included in this bill' })
  lineItems?: BillLineItem[];

  @ApiProperty({
    type: [PaymentApplication],
    description: 'Payment applications against this bill',
  })
  paymentApplications?: PaymentApplication[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
