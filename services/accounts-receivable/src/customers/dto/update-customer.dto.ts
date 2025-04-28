import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean, 
  IsNumber,
  Min,
  MaxLength
} from 'class-validator';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer name', example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  @ApiPropertyOptional({ description: 'Customer email', example: 'info@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string | null;

  @ApiPropertyOptional({ description: 'Customer phone', example: '555-123-4567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Customer address', example: '123 Main St' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiPropertyOptional({ description: 'Customer city', example: 'San Francisco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @ApiPropertyOptional({ description: 'Customer state/province', example: 'CA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string | null;

  @ApiPropertyOptional({ description: 'Customer zip/postal code', example: '94105' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string | null;

  @ApiPropertyOptional({ description: 'Customer country', example: 'USA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string | null;

  @ApiPropertyOptional({ description: 'Customer tax ID/EIN', example: '12-3456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string | null;

  @ApiPropertyOptional({ description: 'Customer website', example: 'https://www?.acme.com' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  website?: string | null;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;

  @ApiPropertyOptional({ description: 'Is customer active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null;

  @ApiPropertyOptional({ description: 'Customer credit limit', example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number | null;
} 