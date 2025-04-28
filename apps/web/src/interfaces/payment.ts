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
  id?: string;
  paymentId?: string;
  invoiceId: string;
  invoice?: any;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customer?: any;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status: PaymentStatus;
  bankAccountId?: string;
  applications?: PaymentApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorPaymentApplication {
  id?: string;
  paymentId?: string;
  billId: string;
  bill?: any;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendor?: any;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status: PaymentStatus;
  bankAccountId?: string;
  applications?: VendorPaymentApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerPaymentDto {
  paymentNumber?: string;
  customerId: string;
  paymentDate: Date | string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status?: PaymentStatus;
  bankAccountId?: string;
  applications: { invoiceId: string; amount: number }[];
}

export interface CreateVendorPaymentDto {
  paymentNumber?: string;
  vendorId: string;
  paymentDate: Date | string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  memo?: string;
  status?: PaymentStatus;
  bankAccountId?: string;
  applications: { billId: string; amount: number }[];
}

export interface UpdatePaymentDto {
  paymentDate?: Date | string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  memo?: string;
  status?: PaymentStatus;
  bankAccountId?: string;
}

export interface ApplyCustomerPaymentDto {
  paymentId: string;
  applications: { invoiceId: string; amount: number }[];
}

export interface ApplyVendorPaymentDto {
  paymentId: string;
  applications: { billId: string; amount: number }[];
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  customerId?: string;
  vendorId?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} 