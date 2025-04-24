import { 
  Customer, 
  CustomerContact, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CreateCustomerContactDto, 
  CustomerListParams 
} from '@qbit/shared-types';
import { ApiClientOptions, apiFetch } from '../utils/api-fetch';

export class CustomersClient {
  private baseUrl: string;
  private options: ApiClientOptions;

  constructor(baseUrl: string, options: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
  }

  async getCustomers(params?: CustomerListParams): Promise<{ 
    data: Customer[]; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortDirection) searchParams.append('sortDirection', params.sortDirection);
    }

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiFetch<{ data: Customer[]; total: number; page: number; limit: number }>(
      `${this.baseUrl}/customers${queryString}`,
      { ...this.options }
    );
  }

  async getCustomerById(id: string): Promise<Customer> {
    return apiFetch<Customer>(`${this.baseUrl}/customers/${id}`, { ...this.options });
  }

  async getCustomerByNumber(customerNumber: string): Promise<Customer> {
    return apiFetch<Customer>(`${this.baseUrl}/customers/number/${customerNumber}`, { ...this.options });
  }

  async createCustomer(customer: CreateCustomerDto): Promise<Customer> {
    return apiFetch<Customer>(`${this.baseUrl}/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
      ...this.options,
    });
  }

  async updateCustomer(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    return apiFetch<Customer>(`${this.baseUrl}/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
      ...this.options,
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/customers/${id}`, {
      method: 'DELETE',
      ...this.options,
    });
  }

  // Contact methods
  async createContact(customerId: string, contact: CreateCustomerContactDto): Promise<CustomerContact> {
    return apiFetch<CustomerContact>(`${this.baseUrl}/customers/${customerId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contact),
      ...this.options,
    });
  }

  async updateContact(id: string, contact: Partial<CreateCustomerContactDto>): Promise<CustomerContact> {
    return apiFetch<CustomerContact>(`${this.baseUrl}/customers/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
      ...this.options,
    });
  }

  async deleteContact(id: string): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/customers/contacts/${id}`, {
      method: 'DELETE',
      ...this.options,
    });
  }
} 