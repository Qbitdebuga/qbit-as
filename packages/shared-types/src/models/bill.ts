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
  id: number | null;
  billId: number | null;
  description: string | null;
  accountId?: number | null;
  quantity: number | null;
  unitPrice: number | null;
  discountPercent?: number | null;
  taxPercent?: number | null;
  lineTotal: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id: number | null;
  billNumber: string | null;
  vendorId: number | null;
  vendor?: any; // This will be populated with vendor data when needed
  reference?: string | null;
  issueDate: Date;
  dueDate: Date;
  status: BillStatus;
  subtotal: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  totalAmount: number | null;
  amountPaid: number | null;
  balanceDue: number | null;
  notes?: string | null;
  terms?: string | null;
  lineItems?: BillLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillLineItemDto {
  description: string | null;
  accountId?: number | null;
  quantity: number | null;
  unitPrice: number | null;
  discountPercent?: number | null;
  taxPercent?: number | null;
  lineTotal: number | null;
  notes?: string | null;
}

export interface CreateBillDto {
  billNumber?: string | null; // Optional, can be auto-generated
  vendorId: number | null;
  reference?: string | null;
  issueDate: Date;
  dueDate: Date;
  status?: BillStatus;
  subtotal: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  totalAmount: number | null;
  notes?: string | null;
  terms?: string | null;
  lineItems: CreateBillLineItemDto[];
}

// API client compatible type alias
export type BillCreate = CreateBillDto;

export interface UpdateBillDto {
  vendorId?: number | null;
  reference?: string | null;
  issueDate?: Date;
  dueDate?: Date;
  status?: BillStatus;
  subtotal?: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  totalAmount?: number | null;
  amountPaid?: number | null;
  balanceDue?: number | null;
  notes?: string | null;
  terms?: string | null;
}

// API client compatible type alias
export type BillUpdate = UpdateBillDto;

export interface UpdateBillLineItemDto {
  id?: number | null;
  description?: string | null;
  accountId?: number | null;
  quantity?: number | null;
  unitPrice?: number | null;
  discountPercent?: number | null;
  taxPercent?: number | null;
  lineTotal?: number | null;
  notes?: string | null;
}

export interface BillListParams {
  page?: number | null;
  limit?: number | null;
  status?: BillStatus;
  vendorId?: number | null;
  fromDate?: Date;
  toDate?: Date;
  search?: string | null;
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
} 