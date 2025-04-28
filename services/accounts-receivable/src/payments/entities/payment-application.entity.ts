export class PaymentApplication {
  id!: string | null;
  paymentId!: string | null;
  invoiceId!: string | null;
  amountApplied!: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<PaymentApplication>) {
    Object.assign(this, partial);
  }
} 