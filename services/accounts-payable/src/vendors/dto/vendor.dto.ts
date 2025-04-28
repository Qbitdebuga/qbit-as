import { ApiProperty } from '@nestjs/swagger';

export class VendorDto {
  @ApiProperty({ description: 'Unique identifier of the vendor' })
  id: string | null;

  @ApiProperty({ description: 'Unique vendor number for identification' })
  vendorNumber: string | null;

  @ApiProperty({ description: 'Name of the vendor' })
  name: string | null;

  @ApiProperty({ description: 'Email address of the vendor', required: false })
  email?: string | null;

  @ApiProperty({ description: 'Phone number of the vendor', required: false })
  phone?: string | null;

  @ApiProperty({ description: 'Street address of the vendor', required: false })
  address?: string | null;

  @ApiProperty({ description: 'City of the vendor', required: false })
  city?: string | null;

  @ApiProperty({ description: 'State/province of the vendor', required: false })
  state?: string | null;

  @ApiProperty({ description: 'ZIP/Postal code of the vendor', required: false })
  zipCode?: string | null;

  @ApiProperty({ description: 'Country of the vendor', required: false })
  country?: string | null;

  @ApiProperty({ description: 'Tax identification number', required: false })
  taxId?: string | null;

  @ApiProperty({ description: 'Website of the vendor', required: false })
  website?: string | null;

  @ApiProperty({ description: 'Additional notes about the vendor', required: false })
  notes?: string | null;

  @ApiProperty({ description: 'Whether the vendor is active', default: true })
  isActive: boolean | null;

  @ApiProperty({ description: 'Payment terms in days', default: 30 })
  paymentTerms: number | null;

  @ApiProperty({ description: 'Default account ID for this vendor', required: false })
  defaultAccountId?: string | null;

  @ApiProperty({ description: 'Credit limit for this vendor', required: false })
  creditLimit?: number | null;

  @ApiProperty({ description: 'Date and time when the vendor was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the vendor was last updated' })
  updatedAt: Date;
} 