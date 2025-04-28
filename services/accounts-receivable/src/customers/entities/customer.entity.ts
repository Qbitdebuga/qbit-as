import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerContact } from './customer-contact.entity';

export class Customer {
  @ApiProperty({ description: 'Unique identifier', example: 'e5f6-g7h8-i9j0-k1l2' })
  id!: string | null;

  @ApiProperty({ description: 'Customer number', example: 'CUST-00001' })
  customerNumber!: string | null;

  @ApiProperty({ description: 'Customer name', example: 'Acme Inc.' })
  name!: string | null;

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@acme.com' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Phone number', example: '555-123-4567' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  address?: string | null;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'State/Province', example: 'NY' })
  state?: string | null;

  @ApiPropertyOptional({ description: 'Zip/Postal code', example: '10001' })
  zipCode?: string | null;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'Tax identification number', example: '12-3456789' })
  taxId?: string | null;

  @ApiPropertyOptional({ description: 'Website', example: 'https://www?.acme.com' })
  website?: string | null;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  notes?: string | null;

  @ApiProperty({ description: 'Is customer active', default: true })
  isActive!: boolean | null;

  @ApiPropertyOptional({ description: 'Credit limit', example: 5000 })
  creditLimit?: number | null;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Customer contacts', type: [CustomerContact] })
  contacts?: CustomerContact[];
} 