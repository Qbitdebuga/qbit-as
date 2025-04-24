import { ApiClientBase } from '../utils/api-client-base';
import { 
  Payment, 
  CreatePaymentDto, 
  UpdatePaymentDto,
  ApplyPaymentDto,
  PaymentStatus
} from '@qbit/shared-types';

export class PaymentsClient extends ApiClientBase {
  /**
   * Fetches all payments
   */
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<Payment[]> {
    return this.get<Payment[]>('/payments', { params });
  }

  /**
   * Fetches a specific payment by ID
   */
  async getPaymentById(id: string | number): Promise<Payment> {
    return this.get<Payment>(`/payments/${id}`);
  }

  /**
   * Fetches payments related to a specific invoice
   */
  async getPaymentsByInvoice(invoiceId: string | number): Promise<Payment[]> {
    return this.get<Payment[]>(`/payments/by-invoice/${invoiceId}`);
  }

  /**
   * Fetches payments related to a specific customer
   */
  async getPaymentsByCustomer(customerId: string | number): Promise<Payment[]> {
    return this.get<Payment[]>(`/payments/by-customer/${customerId}`);
  }

  /**
   * Creates a new payment
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.post<Payment>('/payments', data);
  }

  /**
   * Updates an existing payment
   */
  async updatePayment(id: string | number, data: UpdatePaymentDto): Promise<Payment> {
    return this.patch<Payment>(`/payments/${id}`, data);
  }

  /**
   * Deletes a payment
   */
  async deletePayment(id: string | number): Promise<void> {
    return this.delete(`/payments/${id}`);
  }

  /**
   * Updates payment status
   */
  async updatePaymentStatus(id: string | number, status: PaymentStatus): Promise<Payment> {
    return this.patch<Payment>(`/payments/${id}/status`, { status });
  }

  // Vendor payment methods for Accounts Payable service

  /**
   * Fetches all vendor payments
   */
  async getAllVendorPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<Payment[]> {
    return this.get<Payment[]>('/accounts-payable/payments', { params });
  }

  /**
   * Fetches a specific vendor payment by ID
   */
  async getVendorPaymentById(id: string | number): Promise<Payment> {
    return this.get<Payment>(`/accounts-payable/payments/${id}`);
  }

  /**
   * Fetches payments related to a specific bill
   */
  async getPaymentsByBill(billId: string | number): Promise<Payment[]> {
    return this.get<Payment[]>(`/accounts-payable/payments/by-bill/${billId}`);
  }

  /**
   * Fetches payments related to a specific vendor
   */
  async getPaymentsByVendor(vendorId: string | number): Promise<Payment[]> {
    return this.get<Payment[]>(`/accounts-payable/payments/by-vendor/${vendorId}`);
  }

  /**
   * Creates a new vendor payment
   */
  async createVendorPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.post<Payment>('/accounts-payable/payments', data);
  }

  /**
   * Updates an existing vendor payment
   */
  async updateVendorPayment(id: string | number, data: UpdatePaymentDto): Promise<Payment> {
    return this.patch<Payment>(`/accounts-payable/payments/${id}`, data);
  }

  /**
   * Deletes a vendor payment
   */
  async deleteVendorPayment(id: string | number): Promise<void> {
    return this.delete(`/accounts-payable/payments/${id}`);
  }

  /**
   * Applies a payment to bills
   */
  async applyPayment(data: ApplyPaymentDto): Promise<Payment> {
    return this.post<Payment>('/accounts-payable/payments/apply', data);
  }
} 