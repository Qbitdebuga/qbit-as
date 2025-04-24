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
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentApplication {
  id: number;
  paymentId: number;
  billId: number;
  bill?: any; // This will be populated with bill data when needed
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  vendorId: number;
  vendor?: any; // This will be populated with vendor data when needed
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status: PaymentStatus;
  bankAccountId?: number;
  applications?: PaymentApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentApplicationDto {
  billId: number;
  amount: number;
}

export interface CreatePaymentDto {
  paymentNumber?: string; // Optional, can be auto-generated
  vendorId: number;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status?: PaymentStatus;
  bankAccountId?: number;
  applications: CreatePaymentApplicationDto[];
}

export interface UpdatePaymentDto {
  paymentDate?: Date;
  amount?: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  memo?: string;
  status?: PaymentStatus;
  bankAccountId?: number;
}

export interface ApplyPaymentDto {
  paymentId: number;
  applications: CreatePaymentApplicationDto[];
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  vendorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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