export interface Vendor {
  id: number;
  vendorNumber: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  paymentTerms?: string;
  defaultAccountId?: number;
  creditLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorContact {
  id: number;
  vendorId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  vendorNumber: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
  paymentTerms?: string;
  defaultAccountId?: number;
  creditLimit?: number;
}

export interface UpdateVendorDto {
  vendorNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
  paymentTerms?: string;
  defaultAccountId?: number;
  creditLimit?: number;
}

export interface CreateVendorContactDto {
  vendorId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface UpdateVendorContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
} 