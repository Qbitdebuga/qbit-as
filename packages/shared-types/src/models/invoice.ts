export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
  CANCELLED = 'CANCELLED'
}

export enum InvoicePaymentMethod {
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

export enum InvoicePaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerReference?: string | null;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount?: number | null;
  discountAmount?: number | null;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  terms?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemCode?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number | null;
  taxPercentage?: number | null;
  lineTotal: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: InvoicePaymentMethod;
  status: InvoicePaymentStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDto {
  customerId: string;
  customerReference?: string;
  invoiceDate: Date;
  dueDate: Date;
  status?: InvoiceStatus;
  notes?: string;
  terms?: string;
  items: CreateInvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  taxPercentage?: number;
  notes?: string;
}

export interface UpdateInvoiceDto {
  customerReference?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  status?: InvoiceStatus;
  notes?: string;
  terms?: string;
}

export interface CreateInvoicePaymentDto {
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: InvoicePaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface InvoiceListParams {
  customerId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} 