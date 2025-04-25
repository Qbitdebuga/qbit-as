import { 
  CreateInvoiceDto, 
  CreateInvoicePaymentDto, 
  Invoice, 
  InvoiceListParams, 
  InvoicePayment, 
  UpdateInvoiceDto 
} from '@qbit/shared-types';
import { ApiClient } from '../lib/api-client';

/**
 * Client for interacting with the invoices API
 */
export class InvoicesClient {
  private readonly client: ApiClient;
  private readonly basePath = '/accounts-receivable/invoices';

  /**
   * Creates a new invoices client
   */
  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Get a paginated list of invoices
   */
  async getInvoices(params?: InvoiceListParams): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    return this.client.get(this.basePath, { params: params as unknown as Record<string, string> });
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    return this.client.get(`${this.basePath}/${id}`);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: CreateInvoiceDto): Promise<Invoice> {
    return this.client.post(this.basePath, invoice);
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: string, updates: UpdateInvoiceDto): Promise<Invoice> {
    return this.client.patch(`${this.basePath}/${id}`, updates);
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    return this.client.delete(`${this.basePath}/${id}`);
  }

  /**
   * Finalize an invoice (change status from DRAFT to PENDING)
   */
  async finalizeInvoice(id: string): Promise<Invoice> {
    return this.client.post(`${this.basePath}/${id}/finalize`, {});
  }

  /**
   * Mark an invoice as sent
   */
  async markInvoiceAsSent(id: string): Promise<Invoice> {
    return this.client.post(`${this.basePath}/${id}/send`, {});
  }

  /**
   * Void an invoice
   */
  async voidInvoice(id: string): Promise<Invoice> {
    return this.client.post(`${this.basePath}/${id}/void`, {});
  }

  /**
   * Record a payment for an invoice
   */
  async createPayment(id: string, payment: CreateInvoicePaymentDto): Promise<InvoicePayment> {
    return this.client.post(`${this.basePath}/${id}/payments`, payment);
  }

  /**
   * Get all payments for an invoice
   */
  async getPaymentsByInvoiceId(id: string): Promise<InvoicePayment[]> {
    return this.client.get(`${this.basePath}/${id}/payments`);
  }

  /**
   * Get all invoices for a customer
   */
  async getInvoicesByCustomer(
    customerId: string, 
    params?: Omit<InvoiceListParams, 'customerId'>
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    return this.client.get(`${this.basePath}/customer/${customerId}`, { params: params as unknown as Record<string, string> });
  }
}