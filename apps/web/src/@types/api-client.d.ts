declare module '@qbit/api-client' {
  export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
  }

  export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    subtype: string;
    description?: string;
    isActive: boolean;
    parentId?: string;
    parent?: Account;
    children?: Account[];
    createdAt: string;
    updatedAt: string;
  }
}

declare module '@qbit-accounting/api-client' {
  import { 
    Bill, 
    CreateBillDto, 
    Vendor,
    Payment,
    CreatePaymentDto,
    UpdatePaymentDto,
    PaymentStatus,
    PaymentListParams
  } from '@qbit/shared-types';

  // Class definitions
  export class BillsClient {
    setAuthToken(token: string): void;
    getBills(): Promise<{ data: Bill[]; total: number }>;
    getBillById(id: string): Promise<Bill>;
    createBill(bill: CreateBillDto): Promise<Bill>;
    updateBill(id: string, bill: Partial<CreateBillDto>): Promise<Bill>;
    deleteBill(id: string): Promise<void>;
    approveBill(id: string): Promise<Bill>;
    cancelBill(id: string): Promise<Bill>;
  }

  export class VendorsClient {
    setAuthToken(token: string): void;
    getVendors(): Promise<{ data: Vendor[]; total: number }>;
    getVendorById(id: string): Promise<Vendor>;
  }
  
  export class PaymentsClient {
    getPayments(params?: PaymentListParams): Promise<{ data: Payment[]; total: number; page: number; limit: number }>;
    getPaymentById(id: string): Promise<Payment>;
    createPayment(payment: CreatePaymentDto): Promise<Payment>;
    updatePayment(id: string, updates: UpdatePaymentDto): Promise<Payment>;
    updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment>;
    deletePayment(id: string): Promise<void>;
    applyPayment(id: string, applications: { billId: string; amount: number }[]): Promise<Payment>;
    getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]>;
    getPaymentsByVendorId(vendorId: string, params?: Omit<PaymentListParams, 'vendorId'>): Promise<{ data: Payment[]; total: number; page: number; limit: number }>;
    createInvoicePayment(invoiceId: string, payment: any): Promise<any>;
  }

  // Exported instances
  export const billsClient: BillsClient;
  export const vendorsClient: VendorsClient;
  export const paymentsClient: PaymentsClient;
  export const accountsPayableClient: {
    vendors: VendorsClient;
    bills: BillsClient;
    payments: PaymentsClient;
  };
} 