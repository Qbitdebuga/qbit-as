import { ApiProperty } from '@nestjs/swagger';

export class VendorDto {
  @ApiProperty({ description: 'Unique identifier of the vendor' })
  id: string;

  @ApiProperty({ description: 'Unique vendor number for identification' })
  vendorNumber: string;

  @ApiProperty({ description: 'Name of the vendor' })
  name: string;

  @ApiProperty({ description: 'Email address of the vendor', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone number of the vendor', required: false })
  phone?: string;

  @ApiProperty({ description: 'Street address of the vendor', required: false })
  address?: string;

  @ApiProperty({ description: 'City of the vendor', required: false })
  city?: string;

  @ApiProperty({ description: 'State/province of the vendor', required: false })
  state?: string;

  @ApiProperty({ description: 'ZIP/Postal code of the vendor', required: false })
  zipCode?: string;

  @ApiProperty({ description: 'Country of the vendor', required: false })
  country?: string;

  @ApiProperty({ description: 'Tax identification number', required: false })
  taxId?: string;

  @ApiProperty({ description: 'Website of the vendor', required: false })
  website?: string;

  @ApiProperty({ description: 'Additional notes about the vendor', required: false })
  notes?: string;

  @ApiProperty({ description: 'Whether the vendor is active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Payment terms in days', default: 30 })
  paymentTerms: number;

  @ApiProperty({ description: 'Default account ID for this vendor', required: false })
  defaultAccountId?: string;

  @ApiProperty({ description: 'Credit limit for this vendor', required: false })
  creditLimit?: number;

  @ApiProperty({ description: 'Date and time when the vendor was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the vendor was last updated' })
  updatedAt: Date;
} 