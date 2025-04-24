export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
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
  isActive: boolean;
  creditLimit?: number | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: CustomerContact[];
}

export interface CustomerContact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  customerNumber?: string;
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
  creditLimit?: number;
  contacts?: CreateCustomerContactDto[];
}

export interface CreateCustomerContactDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface UpdateCustomerDto {
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
  creditLimit?: number;
}

export interface UpdateCustomerContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface CustomerListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} 