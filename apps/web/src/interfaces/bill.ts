export enum BillStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
  CANCELLED = 'CANCELLED'
}

export interface BillLineItem {
  id?: string;
  billId?: string;
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

export interface Bill {
  id: string;
  billNumber: string;
  vendorId: string;
  vendor?: any;
  invoiceNumber: string;
  reference?: string;
  issueDate: Date;
  dueDate: Date;
  status: BillStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  lineItems?: BillLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillDto {
  vendorId: string;
  invoiceNumber: string;
  reference?: string;
  issueDate: Date | string;
  dueDate: Date | string;
  status?: BillStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  lineItems: BillLineItem[];
}

export interface UpdateBillDto {
  vendorId?: string;
  invoiceNumber?: string;
  reference?: string;
  issueDate?: Date | string;
  dueDate?: Date | string;
  status?: BillStatus;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  terms?: string;
  lineItems?: BillLineItem[];
}

export interface BillFilters {
  status?: BillStatus;
  vendorId?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BillWithTotal {
  totalCount: number;
  bills: Bill[];
} 