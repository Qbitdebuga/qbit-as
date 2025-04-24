export class PaymentApplication {
  id!: string;
  paymentId!: string;
  invoiceId!: string;
  amountApplied!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<PaymentApplication>) {
    Object.assign(this, partial);
  }
} 