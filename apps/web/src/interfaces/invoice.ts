export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceLineItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId?: string;
  accountCode?: string;
  taxRate?: number;
  taxAmount?: number;
  productId?: string;
  product?: any;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: any;
  reference?: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  lineItems?: InvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDto {
  customerId: string;
  invoiceNumber?: string;
  reference?: string;
  issueDate: Date | string;
  dueDate: Date | string;
  status?: InvoiceStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  lineItems: InvoiceLineItem[];
}

export interface UpdateInvoiceDto {
  customerId?: string;
  reference?: string;
  issueDate?: Date | string;
  dueDate?: Date | string;
  status?: InvoiceStatus;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  terms?: string;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface InvoiceWithTotal {
  totalCount: number;
  invoices: Invoice[];
} 