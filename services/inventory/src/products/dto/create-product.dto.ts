import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsUrl, 
  MaxLength, 
  Min, 
  IsPositive 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiPropertyOptional({ 
    example: 'PROD-001', 
    description: 'Stock Keeping Unit (will be auto-generated if not provided)' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ example: 'Office Chair', description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ 
    example: 'Ergonomic office chair with adjustable height', 
    description: 'Detailed description of the product' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID of the category this product belongs to' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ example: 199.99, description: 'Selling price of the product' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 120.00, description: 'Cost price of the product' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({ 
    example: 15, 
    description: 'Initial quantity in stock', 
    default: 0 
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantityOnHand?: number;

  @ApiPropertyOptional({ example: 5, description: 'Level at which to reorder the product' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reorderPoint?: number;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the product is active', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the product can be sold', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isSellable?: boolean;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the product can be purchased', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isPurchasable?: boolean;

  @ApiPropertyOptional({ example: '123456789012', description: 'Barcode for the product' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ example: 5.2, description: 'Weight of the product' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Unit of weight measurement' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  weightUnit?: string;

  @ApiPropertyOptional({ 
    example: '{"length": 60, "width": 60, "height": 120, "unit": "cm"}', 
    description: 'Dimensions of the product in JSON format' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  dimensions?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the product is taxable', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'ID of the applicable tax rate' })
  @IsNumber()
  @IsOptional()
  taxRateId?: number;

  @ApiPropertyOptional({ example: 5001, description: 'General Ledger account ID for this product' })
  @IsNumber()
  @IsOptional()
  accountId?: number;

  @ApiPropertyOptional({ 
    example: 'https://example.com/images/chair.jpg', 
    description: 'URL to the product image' 
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
} 