import {
  ApplyPaymentDto,
  CreatePaymentDto,
  Payment,
  PaymentListParams,
  UpdatePaymentDto,
  PaymentStatus,
  CreatePaymentRequest,
  PaymentResponse,
} from '@qbit/shared-types';
import { ApiClientBase } from '../utils/api-client-base';
import { ApiClient } from '../api-client';

/**
 * Client for interacting with the payments API
 */
export class PaymentsClient extends ApiClientBase {
  private readonly apBasePath = '/accounts-payable/payments';
  private readonly arBasePath = '/accounts-receivable/payments';

  /**
   * Creates a new payments client
   */
  constructor(apiClient: ApiClient) {
    super(apiClient);
  }

  /**
   * Get a paginated list of payments (accounts receivable)
   */
  async getPayments(params?: PaymentListParams): Promise<{
    data: PaymentResponse[];
    total: number | null;
    page: number | null;
    limit: number;
  }> {
    return this.get(this.arBasePath, { params: params as Record<string, any> });
  }

  /**
   * Get a single payment by ID (accounts receivable)
   */
  async getPaymentById(id: string): Promise<PaymentResponse> {
    return this.get(`${this.arBasePath}/${id}`);
  }

  /**
   * Create a new payment (accounts receivable)
   */
  async createPayment(payment: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.post(this.arBasePath, payment);
  }

  /**
   * Update an existing payment (accounts receivable)
   */
  async updatePayment(id: string, updates: UpdatePaymentDto): Promise<PaymentResponse> {
    return this.patch(`${this.arBasePath}/${id}`, updates);
  }

  /**
   * Delete a payment (accounts receivable)
   */
  async deletePayment(id: string): Promise<void> {
    return this.delete(`${this.arBasePath}/${id}`);
  }

  /**
   * Apply a payment to invoices (accounts receivable)
   */
  async applyPayment(
    paymentId: string,
    applyPaymentDto: ApplyPaymentDto,
  ): Promise<PaymentResponse> {
    return this.post(`${this.arBasePath}/${paymentId}/apply`, applyPaymentDto);
  }

  /**
   * Get all payments for an invoice (accounts receivable)
   */
  async getPaymentsByInvoiceId(invoiceId: string): Promise<PaymentResponse[]> {
    return this.get(`${this.arBasePath}/invoice/${invoiceId}`);
  }

  /**
   * Get all payments for a vendor (accounts payable)
   */
  async getPaymentsByVendorId(vendorId: string): Promise<Payment[]> {
    return this.get(`${this.apBasePath}/vendor/${vendorId}`);
  }

  /**
   * Get a paginated list of payments (accounts payable)
   */
  async getVendorPayments(
    params?: PaymentListParams,
  ): Promise<{ data: Payment[]; total: number | null; page: number | null; limit: number }> {
    return this.get(this.apBasePath, { params: params as Record<string, any> });
  }

  /**
   * Get a single payment by ID (accounts payable)
   */
  async getVendorPaymentById(id: string): Promise<Payment> {
    return this.get(`${this.apBasePath}/${id}`);
  }

  /**
   * Create a new payment to a vendor (accounts payable)
   */
  async createVendorPayment(payment: CreatePaymentDto): Promise<Payment> {
    return this.post(this.apBasePath, payment);
  }

  /**
   * Update an existing vendor payment (accounts payable)
   */
  async updateVendorPayment(id: string, updates: UpdatePaymentDto): Promise<Payment> {
    return this.patch(`${this.apBasePath}/${id}`, updates);
  }

  /**
   * Delete a vendor payment (accounts payable)
   */
  async deleteVendorPayment(id: string): Promise<void> {
    return this.delete(`${this.apBasePath}/${id}`);
  }
}
