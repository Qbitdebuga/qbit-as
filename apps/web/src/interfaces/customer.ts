export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
  OTHER = 'OTHER'
}

export interface CustomerAddress {
  id?: string;
  customerId?: string;
  type: 'BILLING' | 'SHIPPING' | 'OTHER';
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface CustomerContact {
  id?: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email?: string;
  phone?: string;
  type: CustomerType;
  status: CustomerStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  creditLimit?: number;
  addresses?: CustomerAddress[];
  contacts?: CustomerContact[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  customerNumber?: string;
  name: string;
  email?: string;
  phone?: string;
  type: CustomerType;
  status?: CustomerStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  creditLimit?: number;
  addresses?: Omit<CustomerAddress, 'id' | 'customerId'>[];
  contacts?: Omit<CustomerContact, 'id' | 'customerId'>[];
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  website?: string;
  taxId?: string;
  notes?: string;
  creditLimit?: number;
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
}

export interface CustomerFilters {
  status?: CustomerStatus;
  type?: CustomerType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CustomerWithTotal {
  totalCount: number;
  customers: Customer[];
} 