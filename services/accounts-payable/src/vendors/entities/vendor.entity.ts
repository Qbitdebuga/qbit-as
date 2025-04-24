import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Vendor {
  @ApiProperty({ description: 'The unique identifier of the vendor' })
  id: number;

  @ApiProperty({ description: 'The unique vendor number' })
  vendorNumber: string;

  @ApiProperty({ description: 'The name of the vendor' })
  name: string;

  @ApiPropertyOptional({ description: 'The email of the vendor' })
  email?: string;

  @ApiPropertyOptional({ description: 'The phone number of the vendor' })
  phone?: string;

  @ApiPropertyOptional({ description: 'The address of the vendor' })
  address?: string;

  @ApiPropertyOptional({ description: 'The city of the vendor' })
  city?: string;

  @ApiPropertyOptional({ description: 'The state or province of the vendor' })
  state?: string;

  @ApiPropertyOptional({ description: 'The zip or postal code of the vendor' })
  zipCode?: string;

  @ApiPropertyOptional({ description: 'The country of the vendor' })
  country?: string;

  @ApiPropertyOptional({ description: 'The tax ID of the vendor' })
  taxId?: string;

  @ApiPropertyOptional({ description: 'The website of the vendor' })
  website?: string;

  @ApiPropertyOptional({ description: 'Notes about the vendor' })
  notes?: string;

  @ApiProperty({ description: 'Whether the vendor is active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'The payment terms for the vendor', example: 'net30' })
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'The ID of the default account for this vendor' })
  defaultAccountId?: number;

  @ApiPropertyOptional({ description: 'The credit limit for the vendor', default: 0 })
  creditLimit?: number;

  @ApiProperty({ description: 'The date when the vendor was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the vendor was last updated' })
  updatedAt: Date;
}

export class VendorContact {
  @ApiProperty({ description: 'The unique identifier of the contact' })
  id: number;

  @ApiProperty({ description: 'The ID of the vendor this contact belongs to' })
  vendorId: number;

  @ApiProperty({ description: 'The first name of the contact' })
  firstName: string;

  @ApiProperty({ description: 'The last name of the contact' })
  lastName: string;

  @ApiPropertyOptional({ description: 'The email of the contact' })
  email?: string;

  @ApiPropertyOptional({ description: 'The phone number of the contact' })
  phone?: string;

  @ApiPropertyOptional({ description: 'The job position of the contact' })
  position?: string;

  @ApiProperty({ description: 'Whether this is the primary contact', default: false })
  isPrimary: boolean;

  @ApiProperty({ description: 'The date when the contact was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the contact was last updated' })
  updatedAt: Date;
} 