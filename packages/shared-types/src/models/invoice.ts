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
  id: string | null;
  invoiceNumber: string | null;
  customerId: string | null;
  customerReference?: string | null;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  totalAmount: number | null;
  amountPaid: number | null;
  balanceDue: number | null;
  notes?: string | null;
  terms?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface InvoiceItem {
  id: string | null;
  invoiceId: string | null;
  itemCode?: string | null;
  description: string | null;
  quantity: number | null;
  unitPrice: number | null;
  discountPercentage?: number | null;
  taxPercentage?: number | null;
  lineTotal: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoicePayment {
  id: string | null;
  invoiceId: string | null;
  paymentDate: Date;
  amount: number | null;
  paymentMethod: InvoicePaymentMethod;
  status: InvoicePaymentStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDto {
  customerId: string | null;
  customerReference?: string | null;
  invoiceDate: Date;
  dueDate: Date;
  status?: InvoiceStatus;
  notes?: string | null;
  terms?: string | null;
  items: CreateInvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
  itemCode?: string | null;
  description: string | null;
  quantity: number | null;
  unitPrice: number | null;
  discountPercentage?: number | null;
  taxPercentage?: number | null;
  notes?: string | null;
}

export interface UpdateInvoiceDto {
  customerReference?: string | null;
  invoiceDate?: Date;
  dueDate?: Date;
  status?: InvoiceStatus;
  notes?: string | null;
  terms?: string | null;
}

export interface CreateInvoicePaymentDto {
  invoiceId: string | null;
  paymentDate: Date;
  amount: number | null;
  paymentMethod: InvoicePaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface InvoiceListParams {
  customerId?: string | null;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string | null;
  page?: number | null;
  limit?: number | null;
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
} 