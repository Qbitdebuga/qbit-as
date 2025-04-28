export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum VendorType {
  SUPPLIER = 'SUPPLIER',
  CONTRACTOR = 'CONTRACTOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  OTHER = 'OTHER'
}

export interface VendorAddress {
  id?: string;
  vendorId?: string;
  type: 'BILLING' | 'SHIPPING' | 'OTHER';
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface VendorContact {
  id?: string;
  vendorId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface Vendor {
  id: string;
  vendorNumber: string;
  name: string;
  email?: string;
  phone?: string;
  type: VendorType;
  status: VendorStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
  defaultAccountId?: string;
  creditLimit?: number;
  addresses?: VendorAddress[];
  contacts?: VendorContact[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  vendorNumber?: string;
  name: string;
  email?: string;
  phone?: string;
  type: VendorType;
  status?: VendorStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
  defaultAccountId?: string;
  creditLimit?: number;
  addresses?: Omit<VendorAddress, 'id' | 'vendorId'>[];
  contacts?: Omit<VendorContact, 'id' | 'vendorId'>[];
}

export interface UpdateVendorDto {
  name?: string;
  email?: string;
  phone?: string;
  type?: VendorType;
  status?: VendorStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
  defaultAccountId?: string;
  creditLimit?: number;
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
}

export interface VendorFilters {
  status?: VendorStatus;
  type?: VendorType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface VendorWithTotal {
  totalCount: number;
  vendors: Vendor[];
} 