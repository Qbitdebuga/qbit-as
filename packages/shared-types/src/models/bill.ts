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
  id: number;
  billId: number;
  description: string;
  accountId?: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  lineTotal: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id: number;
  billNumber: string;
  vendorId: number;
  vendor?: any; // This will be populated with vendor data when needed
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

export interface CreateBillLineItemDto {
  description: string;
  accountId?: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  lineTotal: number;
  notes?: string;
}

export interface CreateBillDto {
  billNumber?: string; // Optional, can be auto-generated
  vendorId: number;
  reference?: string;
  issueDate: Date;
  dueDate: Date;
  status?: BillStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  lineItems: CreateBillLineItemDto[];
}

export interface UpdateBillDto {
  vendorId?: number;
  reference?: string;
  issueDate?: Date;
  dueDate?: Date;
  status?: BillStatus;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  amountPaid?: number;
  balanceDue?: number;
  notes?: string;
  terms?: string;
}

export interface UpdateBillLineItemDto {
  id?: number;
  description?: string;
  accountId?: number;
  quantity?: number;
  unitPrice?: number;
  discountPercent?: number;
  taxPercent?: number;
  lineTotal?: number;
  notes?: string;
}

export interface BillListParams {
  page?: number;
  limit?: number;
  status?: BillStatus;
  vendorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} 