import { AxiosInstance } from 'axios';
import { 
  Payment, 
  CreatePaymentRequest, 
  PaymentStatus,
  PaymentResponse
} from '@qbit/shared-types';

export class PaymentsClient {
  private apiBase: string;

  constructor(private httpClient: AxiosInstance, baseUrl: string = '/api') {
    this.apiBase = `${baseUrl}/payments`;
  }

  async getPayments(): Promise<Payment[]> {
    const response = await this.httpClient.get<Payment[]>(this.apiBase);
    return response.data;
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await this.httpClient.get<Payment>(`${this.apiBase}/${id}`);
    return response.data;
  }

  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const response = await this.httpClient.get<Payment[]>(`${this.apiBase}/invoice/${invoiceId}`);
    return response.data;
  }

  async createPayment(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await this.httpClient.post<Payment>(this.apiBase, payment);
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await this.httpClient.delete(`${this.apiBase}/${id}`);
  }
} 