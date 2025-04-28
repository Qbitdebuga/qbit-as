export interface Vendor {
  id: number | null;
  vendorNumber: string | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  website?: string | null;
  notes?: string | null;
  isActive: boolean | null;
  paymentTerms?: string | null;
  defaultAccountId?: number | null;
  creditLimit?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorContact {
  id: number | null;
  vendorId: number | null;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  vendorNumber: string | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  website?: string | null;
  notes?: string | null;
  isActive?: boolean | null;
  paymentTerms?: string | null;
  defaultAccountId?: number | null;
  creditLimit?: number | null;
}

export interface UpdateVendorDto {
  vendorNumber?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  website?: string | null;
  notes?: string | null;
  isActive?: boolean | null;
  paymentTerms?: string | null;
  defaultAccountId?: number | null;
  creditLimit?: number | null;
}

export interface CreateVendorContactDto {
  vendorId: number | null;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary?: boolean | null;
}

export interface UpdateVendorContactDto {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary?: boolean | null;
}
