import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerContact } from './customer-contact.entity';

export class Customer {
  @ApiProperty({ description: 'Unique identifier', example: 'e5f6-g7h8-i9j0-k1l2' })
  id!: string;

  @ApiProperty({ description: 'Customer number', example: 'CUST-00001' })
  customerNumber!: string;

  @ApiProperty({ description: 'Customer name', example: 'Acme Inc.' })
  name!: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@acme.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '555-123-4567' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  address?: string;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province', example: 'NY' })
  state?: string;

  @ApiPropertyOptional({ description: 'Zip/Postal code', example: '10001' })
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  country?: string;

  @ApiPropertyOptional({ description: 'Tax identification number', example: '12-3456789' })
  taxId?: string;

  @ApiPropertyOptional({ description: 'Website', example: 'https://www.acme.com' })
  website?: string;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  notes?: string;

  @ApiProperty({ description: 'Is customer active', default: true })
  isActive!: boolean;

  @ApiPropertyOptional({ description: 'Credit limit', example: 5000 })
  creditLimit?: number;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Customer contacts', type: [CustomerContact] })
  contacts?: CustomerContact[];
} 