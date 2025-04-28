import {
  Customer,
  CustomerContact,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateCustomerContactDto,
  CustomerListParams,
} from '@qbit/shared-types';
import { ApiClient } from '../api-client';
import { ApiClientBase } from '../utils/api-client-base';

export class CustomersClient extends ApiClientBase {
  private baseUrl: string | null;

  constructor(apiClient: ApiClient) {
    super(apiClient);
    this.baseUrl = '/customers';
  }

  async getCustomers(params?: CustomerListParams): Promise<{
    data: Customer[];
    total: number | null;
    page: number | null;
    limit: number;
  }> {
    const searchParams: Record<string, string> = {};

    if (params) {
      if (params.page) searchParams['page'] = params?.page.toString();
      if (params.limit) searchParams['limit'] = params?.limit.toString();
      if (params.search) searchParams['search'] = params.search;
      if (params.isActive !== undefined) searchParams['isActive'] = params?.isActive.toString();
      if (params.sortBy) searchParams['sortBy'] = params.sortBy;
      if (params.sortDirection) searchParams['sortDirection'] = params.sortDirection;
    }

    return this.get<{ data: Customer[]; total: number | null; page: number | null; limit: number }>(
      this.baseUrl,
      { params: searchParams },
    );
  }

  async getCustomerById(id: string): Promise<Customer> {
    return this.get<Customer>(`${this.baseUrl}/${id}`);
  }

  async getCustomerByNumber(customerNumber: string): Promise<Customer> {
    return this.get<Customer>(`${this.baseUrl}/number/${customerNumber}`);
  }

  async createCustomer(customer: CreateCustomerDto): Promise<Customer> {
    return this.post<Customer>(this.baseUrl, customer);
  }

  async updateCustomer(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    return this.put<Customer>(`${this.baseUrl}/${id}`, customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Contact methods
  async createContact(
    customerId: string,
    contact: CreateCustomerContactDto,
  ): Promise<CustomerContact> {
    return this.post<CustomerContact>(`${this.baseUrl}/${customerId}/contacts`, contact);
  }

  async updateContact(
    id: string,
    contact: Partial<CreateCustomerContactDto>,
  ): Promise<CustomerContact> {
    return this.put<CustomerContact>(`${this.baseUrl}/contacts/${id}`, contact);
  }

  async deleteContact(id: string): Promise<void> {
    return this.delete<void>(`${this.baseUrl}/contacts/${id}`);
  }
}
