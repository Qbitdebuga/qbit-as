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
  IsPositive, 
  IsObject 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiPropertyOptional({ 
    example: 'PROD-001-BLK-L', 
    description: 'Stock Keeping Unit (will be auto-generated if not provided)' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string | null;

  @ApiProperty({ example: 'Office Chair - Black, Large', description: 'Name of the variant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string | null;

  @ApiPropertyOptional({ 
    example: { color: 'Black', size: 'Large' }, 
    description: 'Attributes that differentiate this variant' 
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ example: 219.99, description: 'Selling price specific to this variant' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number | null;

  @ApiPropertyOptional({ example: 130.00, description: 'Cost price specific to this variant' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  cost?: number | null;

  @ApiPropertyOptional({ 
    example: 8, 
    description: 'Initial quantity in stock', 
    default: 0 
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantityOnHand?: number | null;

  @ApiPropertyOptional({ example: 3, description: 'Level at which to reorder this variant' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reorderPoint?: number | null;

  @ApiPropertyOptional({ example: '987654321098', description: 'Barcode for the variant' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string | null;

  @ApiPropertyOptional({ example: 5.5, description: 'Weight of the variant' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number | null;

  @ApiPropertyOptional({ example: 'kg', description: 'Unit of weight measurement' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  weightUnit?: string | null;

  @ApiPropertyOptional({ 
    example: '{"length": 62, "width": 62, "height": 125, "unit": "cm"}', 
    description: 'Dimensions of the variant in JSON format' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  dimensions?: string | null;

  @ApiPropertyOptional({ 
    example: 'https://example.com/images/chair-black-large.jpg', 
    description: 'URL to the variant image' 
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the variant is active', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;
} 