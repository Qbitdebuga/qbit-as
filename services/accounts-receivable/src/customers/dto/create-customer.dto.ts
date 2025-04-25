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
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { CreateCustomerContactDto } from './create-customer-contact.dto';

export class CreateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer number (auto-generated if not provided)', example: 'CUST-00001' })
  @IsOptional()
  @IsString()
  customerNumber?: string;

  @ApiProperty({ description: 'Customer name', example: 'Acme Inc.' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Customer email', example: 'contact@acme.com' })
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

  @ApiPropertyOptional({ description: 'Customer city', example: 'New York' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Customer state/province', example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ description: 'Customer zip/postal code', example: '10001' })
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
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Customer credit limit', example: 5000 })
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