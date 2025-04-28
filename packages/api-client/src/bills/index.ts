import { Bill, BillStatus, BillCreate, BillUpdate } from '@qbit/shared-types';

class BillsClient {
  private baseUrl: string | null;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = `${baseUrl}/bills`;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  async getAllBills(): Promise<Bill[]> {
    return this.request<Bill[]>('');
  }

  async getBillById(id: string): Promise<Bill> {
    return this.request<Bill>(`/${id}`);
  }

  async createBill(billData: BillCreate): Promise<Bill> {
    return this.request<Bill>('', 'POST', billData);
  }

  async updateBill(id: string, billData: BillUpdate): Promise<Bill> {
    return this.request<Bill>(`/${id}`, 'PATCH', billData);
  }

  async deleteBill(id: string): Promise<void> {
    return this.request<void>(`/${id}`, 'DELETE');
  }

  async approveBill(id: string): Promise<Bill> {
    return this.request<Bill>(`/${id}/approve`, 'POST');
  }

  async cancelBill(id: string): Promise<Bill> {
    return this.request<Bill>(`/${id}/cancel`, 'POST');
  }
}

export const billsClient = new BillsClient(); 