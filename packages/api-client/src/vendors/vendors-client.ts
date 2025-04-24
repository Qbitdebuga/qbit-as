import { 
  Vendor, 
  VendorContact, 
  CreateVendorDto, 
  UpdateVendorDto, 
  CreateVendorContactDto
} from '@qbit/shared-types';
import { ApiClient } from '../api-client';
import { ApiClientBase } from '../utils/api-client-base';

export interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export class VendorsClient extends ApiClientBase {
  constructor(apiClient: ApiClient) {
    super(apiClient);
  }

  async getVendors(params?: VendorListParams): Promise<{ 
    data: Vendor[]; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    return this.get<{ data: Vendor[]; total: number; page: number; limit: number }>(
      '/vendors',
      { params }
    );
  }

  async getVendorById(id: string): Promise<Vendor> {
    return this.get<Vendor>(`/vendors/${id}`);
  }

  async getVendorByNumber(vendorNumber: string): Promise<Vendor> {
    return this.get<Vendor>(`/vendors/number/${vendorNumber}`);
  }

  async createVendor(vendor: CreateVendorDto): Promise<Vendor> {
    return this.post<Vendor>('/vendors', vendor);
  }

  async updateVendor(id: string, vendor: UpdateVendorDto): Promise<Vendor> {
    return this.patch<Vendor>(`/vendors/${id}`, vendor);
  }

  async deleteVendor(id: string): Promise<void> {
    return this.delete<void>(`/vendors/${id}`);
  }

  // Contact methods
  async createContact(vendorId: string, contact: CreateVendorContactDto): Promise<VendorContact> {
    return this.post<VendorContact>(`/vendors/${vendorId}/contacts`, contact);
  }

  async updateContact(id: string, contact: Partial<CreateVendorContactDto>): Promise<VendorContact> {
    return this.put<VendorContact>(`/vendors/contacts/${id}`, contact);
  }

  async deleteContact(id: string): Promise<void> {
    return this.delete<void>(`/vendors/contacts/${id}`);
  }
} 