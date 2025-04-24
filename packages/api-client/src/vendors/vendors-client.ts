import { 
  Vendor, 
  VendorContact, 
  CreateVendorDto, 
  UpdateVendorDto, 
  CreateVendorContactDto
} from '@qbit/shared-types';
import { ApiClientOptions, apiFetch } from '../utils/api-fetch';

export interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export class VendorsClient {
  private baseUrl: string;
  private options: ApiClientOptions;

  constructor(baseUrl: string, options: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
  }

  async getVendors(params?: VendorListParams): Promise<{ 
    data: Vendor[]; 
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
    return apiFetch<{ data: Vendor[]; total: number; page: number; limit: number }>(
      `${this.baseUrl}/vendors${queryString}`,
      { ...this.options }
    );
  }

  async getVendorById(id: string): Promise<Vendor> {
    return apiFetch<Vendor>(`${this.baseUrl}/vendors/${id}`, { ...this.options });
  }

  async getVendorByNumber(vendorNumber: string): Promise<Vendor> {
    return apiFetch<Vendor>(`${this.baseUrl}/vendors/number/${vendorNumber}`, { ...this.options });
  }

  async createVendor(vendor: CreateVendorDto): Promise<Vendor> {
    return apiFetch<Vendor>(`${this.baseUrl}/vendors`, {
      method: 'POST',
      body: JSON.stringify(vendor),
      ...this.options,
    });
  }

  async updateVendor(id: string, vendor: UpdateVendorDto): Promise<Vendor> {
    return apiFetch<Vendor>(`${this.baseUrl}/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(vendor),
      ...this.options,
    });
  }

  async deleteVendor(id: string): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/vendors/${id}`, {
      method: 'DELETE',
      ...this.options,
    });
  }

  // Contact methods
  async createContact(vendorId: string, contact: CreateVendorContactDto): Promise<VendorContact> {
    return apiFetch<VendorContact>(`${this.baseUrl}/vendors/${vendorId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contact),
      ...this.options,
    });
  }

  async updateContact(id: string, contact: Partial<CreateVendorContactDto>): Promise<VendorContact> {
    return apiFetch<VendorContact>(`${this.baseUrl}/vendors/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
      ...this.options,
    });
  }

  async deleteContact(id: string): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/vendors/contacts/${id}`, {
      method: 'DELETE',
      ...this.options,
    });
  }
} 