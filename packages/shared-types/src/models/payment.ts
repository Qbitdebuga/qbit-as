export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string | Date;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
}

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 