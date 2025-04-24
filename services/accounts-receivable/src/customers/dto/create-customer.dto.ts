import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean, 
  IsNumber, 
  IsArray, 
  ValidateNested,
  Min,
  MaxLength
} from 'class-validator';
import { CreateCustomerContactDto } from './create-customer-contact.dto';

export class CreateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer number (generated if not provided)', example: 'CUST-00001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerNumber?: string;

  @ApiProperty({ description: 'Customer name', example: 'Acme Corporation' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Customer email', example: 'info@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Customer phone', example: '555-123-4567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Customer address', example: '123 Main St' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Customer city', example: 'San Francisco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Customer state/province', example: 'CA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ description: 'Customer zip/postal code', example: '94105' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Customer country', example: 'USA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ description: 'Customer tax ID/EIN', example: '12-3456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'Customer website', example: 'https://www.acme.com' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  website?: string;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Is customer active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Customer credit limit', example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Customer contacts', type: [CreateCustomerContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerContactDto)
  contacts?: CreateCustomerContactDto[];
} 