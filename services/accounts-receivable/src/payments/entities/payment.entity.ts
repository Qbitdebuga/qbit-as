import { PaymentMethod, PaymentStatus } from '@prisma/client';

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

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial);
  }
} 