import { PaymentMethod } from '../../invoices/entities/payment-method.enum';
import { PaymentStatus } from '../../invoices/entities/payment-status.enum';

export class Payment {
  id!: string;
  invoiceId!: string;
  paymentDate!: Date;
  amount!: number;
  paymentMethod!: PaymentMethod;
  status!: PaymentStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  // Make invoice optional so we can attach invoice details when needed
  invoice?: any;

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial);
  }
} 