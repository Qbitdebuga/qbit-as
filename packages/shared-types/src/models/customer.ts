export interface Customer {
  id: string | null;
  customerNumber: string | null;
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
  creditLimit?: number | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: CustomerContact[];
}

export interface CustomerContact {
  id: string | null;
  customerId: string | null;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  customerNumber?: string | null;
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
  creditLimit?: number | null;
  contacts?: CreateCustomerContactDto[];
}

export interface CreateCustomerContactDto {
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary?: boolean | null;
}

export interface UpdateCustomerDto {
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
  creditLimit?: number | null;
}

export interface UpdateCustomerContactDto {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary?: boolean | null;
}

export interface CustomerListParams {
  search?: string | null;
  isActive?: boolean | null;
  page?: number | null;
  limit?: number | null;
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
} 