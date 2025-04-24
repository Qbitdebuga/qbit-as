import { ApiClient } from '../api-client';
import { ApiClientBase } from '../utils/api-client-base';
import { 
  Payment, 
  CreatePaymentDto, 
  UpdatePaymentDto,
  ApplyPaymentDto,
  PaymentStatus
} from '@qbit/shared-types';

export class PaymentsClient extends ApiClientBase {
  private baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl = '/api/payments') {
    super(apiClient);
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches all payments
   */
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}`, { params });
  }

  /**
   * Fetches a specific payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    return this.get<Payment>(`${this.baseUrl}/${id}`);
  }

  /**
   * Fetches payments related to a specific invoice
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}/by-invoice/${invoiceId}`);
  }

  /**
   * Fetches payments related to a specific customer
   */
  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}/by-customer/${customerId}`);
  }

  /**
   * Creates a new payment
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.post<Payment>(`${this.baseUrl}`, data);
  }

  /**
   * Updates an existing payment
   */
  async updatePayment(id: string, data: UpdatePaymentDto): Promise<Payment> {
    return this.put<Payment>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Deletes a payment
   */
  async deletePayment(id: string): Promise<void> {
    return this.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Updates payment status
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    return this.put<Payment>(`${this.baseUrl}/${id}/status`, { status });
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
  async getVendorPaymentById(id: string): Promise<Payment> {
    return this.get<Payment>(`/accounts-payable/payments/${id}`);
  }

  /**
   * Fetches payments related to a specific bill
   */
  async getPaymentsByBill(billId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`/accounts-payable/payments/by-bill/${billId}`);
  }

  /**
   * Fetches payments related to a specific vendor
   */
  async getPaymentsByVendor(vendorId: string): Promise<Payment[]> {
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
  async updateVendorPayment(id: string, data: UpdatePaymentDto): Promise<Payment> {
    return this.put<Payment>(`/accounts-payable/payments/${id}`, data);
  }

  /**
   * Deletes a vendor payment
   */
  async deleteVendorPayment(id: string): Promise<void> {
    return this.delete<void>(`/accounts-payable/payments/${id}`);
  }

  /**
   * Applies a payment to bills
   */
  async applyPayment(data: ApplyPaymentDto): Promise<Payment> {
    return this.post<Payment>(`${this.baseUrl}/apply`, data);
  }

  async getPaymentsByVendorId(vendorId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}/vendor/${vendorId}`);
  }

  async getPaymentsByBillId(billId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}/bill/${billId}`);
  }

  async applyPaymentToBill(paymentId: string, billId: string, amount: number): Promise<Payment> {
    return this.post<Payment>(`${this.baseUrl}/${paymentId}/apply`, {
      billId,
      amount,
    });
  }

  async voidPayment(id: string): Promise<Payment> {
    return this.post<Payment>(`${this.baseUrl}/${id}/void`, {});
  }

  /* Vendor Payment Methods */
  async getAllVendorPaymentMethods(vendorId: string): Promise<Payment[]> {
    return this.get<Payment[]>(`${this.baseUrl}/vendor/${vendorId}/payment-methods`);
  }

  async getVendorPaymentMethodById(vendorId: string, id: string): Promise<Payment> {
    return this.get<Payment>(`${this.baseUrl}/vendor/${vendorId}/payment-methods/${id}`);
  }

  async createVendorPaymentMethod(
    vendorId: string,
    method: CreatePaymentDto
  ): Promise<Payment> {
    return this.post<Payment>(`${this.baseUrl}/vendor/${vendorId}/payment-methods`, method);
  }

  async updateVendorPaymentMethod(
    vendorId: string,
    id: string,
    method: UpdatePaymentDto
  ): Promise<Payment> {
    return this.put<Payment>(`${this.baseUrl}/vendor/${vendorId}/payment-methods/${id}`, method);
  }

  async deleteVendorPaymentMethod(vendorId: string, id: string): Promise<void> {
    return this.delete<void>(`${this.baseUrl}/vendor/${vendorId}/payment-methods/${id}`);
  }
} 