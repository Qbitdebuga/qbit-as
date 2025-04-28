export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WIRE = 'WIRE',
  ACH = 'ACH',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface PaymentApplication {
  id: number | null;
  paymentId: number | null;
  billId: number | null;
  bill?: any; // This will be populated with bill data when needed
  amount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number | null;
  paymentNumber: string | null;
  vendorId: number | null;
  vendor?: any; // This will be populated with vendor data when needed
  paymentDate: Date;
  amount: number | null;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  memo?: string | null;
  status: PaymentStatus;
  bankAccountId?: number | null;
  applications?: PaymentApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentApplicationDto {
  billId: number | null;
  amount: number | null;
}

export interface CreatePaymentDto {
  paymentNumber?: string | null; // Optional, can be auto-generated
  vendorId: number | null;
  paymentDate: Date;
  amount: number | null;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  memo?: string | null;
  status?: PaymentStatus;
  bankAccountId?: number | null;
  applications: CreatePaymentApplicationDto[];
}

export interface UpdatePaymentDto {
  paymentDate?: Date;
  amount?: number | null;
  paymentMethod?: PaymentMethod;
  reference?: string | null;
  memo?: string | null;
  status?: PaymentStatus;
  bankAccountId?: number | null;
}

export interface ApplyPaymentDto {
  paymentId: number | null;
  applications: CreatePaymentApplicationDto[];
}

export interface PaymentListParams {
  page?: number | null;
  limit?: number | null;
  status?: PaymentStatus;
  vendorId?: number | null;
  fromDate?: Date;
  toDate?: Date;
  search?: string | null;
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
}

export interface CreatePaymentRequest {
  invoiceId: string | null;
  paymentDate: string | null;
  amount: number | null;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
}

export interface PaymentResponse {
  id: string | null;
  invoiceId: string | null;
  paymentDate: string | null;
  amount: number | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
