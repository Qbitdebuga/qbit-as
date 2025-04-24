import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, MaxLength, Min } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ description: 'Vendor number (unique identifier for the vendor)', example: 'V-10001' })
  @IsString()
  @IsOptional()
  vendorNumber?: string;

  @ApiProperty({ description: 'Name of the vendor', example: 'ABC Supplies Inc.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Email address of the vendor', example: 'contact@abcsupplies.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number of the vendor', example: '+1-555-123-4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Street address of the vendor', example: '123 Business Avenue' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'City of the vendor', example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'State or province of the vendor', example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'ZIP or postal code of the vendor', example: '10001' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ description: 'Country of the vendor', example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Tax identification number of the vendor', example: '12-3456789' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ description: 'Website of the vendor', example: 'https://www.abcsupplies.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Additional notes about the vendor', example: 'Preferred supplier for office equipment' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Whether the vendor is active', default: true, example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Payment terms in days', default: 30, example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paymentTerms?: number = 30;

  @ApiProperty({ description: 'Default GL account ID to use for this vendor', example: '2000' })
  @IsString()
  @IsOptional()
  defaultAccountId?: string;

  @ApiProperty({ description: 'Credit limit for the vendor', example: 10000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;
} 