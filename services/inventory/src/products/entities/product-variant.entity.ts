import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';

export class ProductVariant {
  @ApiProperty({ example: 1, description: 'Unique identifier for the variant' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the parent product' })
  productId: number;

  @ApiProperty({ example: 'PROD-001-BLK-L', description: 'Stock Keeping Unit, unique identifier' })
  sku: string;

  @ApiProperty({ example: 'Office Chair - Black, Large', description: 'Name of the variant' })
  name: string;

  @ApiPropertyOptional({ 
    example: '{"color": "Black", "size": "Large"}', 
    description: 'Attributes that differentiate this variant (JSON format)' 
  })
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ example: 219.99, description: 'Selling price specific to this variant' })
  price?: number;

  @ApiPropertyOptional({ example: 130.00, description: 'Cost price specific to this variant' })
  cost?: number;

  @ApiProperty({ example: 8, description: 'Current quantity in stock', default: 0 })
  quantityOnHand: number;

  @ApiPropertyOptional({ example: 3, description: 'Level at which to reorder this variant' })
  reorderPoint?: number;

  @ApiPropertyOptional({ example: '987654321098', description: 'Barcode for the variant' })
  barcode?: string;

  @ApiPropertyOptional({ example: 5.5, description: 'Weight of the variant' })
  weight?: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Unit of weight measurement' })
  weightUnit?: string;

  @ApiPropertyOptional({ example: '{"length": 62, "width": 62, "height": 125, "unit": "cm"}', description: 'Dimensions of the variant in JSON format' })
  dimensions?: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/chair-black-large.jpg', description: 'URL to the variant image' })
  imageUrl?: string;

  @ApiProperty({ example: true, description: 'Whether the variant is active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ type: () => Product, description: 'Parent product' })
  product?: Product;

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the variant was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the variant was last updated' })
  updatedAt: Date;
} 