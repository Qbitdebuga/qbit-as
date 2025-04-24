import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerContact } from './customer-contact.entity';

export class Customer {
  @ApiProperty({ description: 'Unique identifier', example: 'c7fb7b8a-b35d-4d5f-a766-78364b5ac1ff' })
  id: string;

  @ApiProperty({ description: 'Customer number', example: 'CUST-00001' })
  customerNumber: string;

  @ApiProperty({ description: 'Customer name', example: 'Acme Corporation' })
  name: string;

  @ApiPropertyOptional({ description: 'Customer email', example: 'info@acme.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Customer phone', example: '555-123-4567' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Customer address', example: '123 Main St' })
  address?: string;

  @ApiPropertyOptional({ description: 'Customer city', example: 'San Francisco' })
  city?: string;

  @ApiPropertyOptional({ description: 'Customer state/province', example: 'CA' })
  state?: string;

  @ApiPropertyOptional({ description: 'Customer zip/postal code', example: '94105' })
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Customer country', example: 'USA' })
  country?: string;

  @ApiPropertyOptional({ description: 'Customer tax ID/EIN', example: '12-3456789' })
  taxId?: string;

  @ApiPropertyOptional({ description: 'Customer website', example: 'https://www.acme.com' })
  website?: string;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  notes?: string;

  @ApiProperty({ description: 'Is customer active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Customer credit limit', example: 10000 })
  creditLimit?: number;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Customer contacts', type: [CustomerContact] })
  contacts?: CustomerContact[];
} 