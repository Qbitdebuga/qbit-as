import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Vendor {
  @ApiProperty({ description: 'The unique identifier of the vendor' })
  id: number | null;

  @ApiProperty({ description: 'The unique vendor number' })
  vendorNumber: string | null;

  @ApiProperty({ description: 'The name of the vendor' })
  name: string | null;

  @ApiPropertyOptional({ description: 'The email of the vendor' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'The phone number of the vendor' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'The address of the vendor' })
  address?: string | null;

  @ApiPropertyOptional({ description: 'The city of the vendor' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'The state or province of the vendor' })
  state?: string | null;

  @ApiPropertyOptional({ description: 'The zip or postal code of the vendor' })
  zipCode?: string | null;

  @ApiPropertyOptional({ description: 'The country of the vendor' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'The tax ID of the vendor' })
  taxId?: string | null;

  @ApiPropertyOptional({ description: 'The website of the vendor' })
  website?: string | null;

  @ApiPropertyOptional({ description: 'Notes about the vendor' })
  notes?: string | null;

  @ApiProperty({ description: 'Whether the vendor is active', default: true })
  isActive: boolean | null;

  @ApiPropertyOptional({ description: 'The payment terms for the vendor', example: 'net30' })
  paymentTerms?: string | null;

  @ApiPropertyOptional({ description: 'The ID of the default account for this vendor' })
  defaultAccountId?: number | null;

  @ApiPropertyOptional({ description: 'The credit limit for the vendor', default: 0 })
  creditLimit?: number | null;

  @ApiProperty({ description: 'The date when the vendor was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the vendor was last updated' })
  updatedAt: Date;
}

export class VendorContact {
  @ApiProperty({ description: 'The unique identifier of the contact' })
  id: number | null;

  @ApiProperty({ description: 'The ID of the vendor this contact belongs to' })
  vendorId: number | null;

  @ApiProperty({ description: 'The first name of the contact' })
  firstName: string | null;

  @ApiProperty({ description: 'The last name of the contact' })
  lastName: string | null;

  @ApiPropertyOptional({ description: 'The email of the contact' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'The phone number of the contact' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'The job position of the contact' })
  position?: string | null;

  @ApiProperty({ description: 'Whether this is the primary contact', default: false })
  isPrimary: boolean | null;

  @ApiProperty({ description: 'The date when the contact was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the contact was last updated' })
  updatedAt: Date;
} 