import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from './product-category.entity';
import { ProductVariant } from './product-variant.entity';

export class Product {
  @ApiProperty({ example: 1, description: 'Unique identifier for the product' })
  id: number | null;

  @ApiProperty({ example: 'PROD-001', description: 'Stock Keeping Unit, unique identifier' })
  sku: string | null;

  @ApiProperty({ example: 'Office Chair', description: 'Name of the product' })
  name: string | null;

  @ApiPropertyOptional({ example: 'Ergonomic office chair with adjustable height', description: 'Detailed description of the product' })
  description?: string | null;

  @ApiPropertyOptional({ example: 1, description: 'ID of the category this product belongs to' })
  categoryId?: number | null;

  @ApiProperty({ example: 199.99, description: 'Selling price of the product' })
  price: number | null;

  @ApiPropertyOptional({ example: 120.00, description: 'Cost price of the product' })
  cost?: number | null;

  @ApiProperty({ example: 15, description: 'Current quantity in stock', default: 0 })
  quantityOnHand: number | null;

  @ApiPropertyOptional({ example: 5, description: 'Level at which to reorder the product' })
  reorderPoint?: number | null;

  @ApiProperty({ example: true, description: 'Whether the product is active', default: true })
  isActive: boolean | null;

  @ApiProperty({ example: true, description: 'Whether the product can be sold', default: true })
  isSellable: boolean | null;

  @ApiProperty({ example: true, description: 'Whether the product can be purchased', default: true })
  isPurchasable: boolean | null;

  @ApiPropertyOptional({ example: '123456789012', description: 'Barcode for the product' })
  barcode?: string | null;

  @ApiPropertyOptional({ example: 5.2, description: 'Weight of the product' })
  weight?: number | null;

  @ApiPropertyOptional({ example: 'kg', description: 'Unit of weight measurement' })
  weightUnit?: string | null;

  @ApiPropertyOptional({ example: '{"length": 60, "width": 60, "height": 120, "unit": "cm"}', description: 'Dimensions of the product in JSON format' })
  dimensions?: string | null;

  @ApiProperty({ example: true, description: 'Whether the product is taxable', default: true })
  taxable: boolean | null;

  @ApiPropertyOptional({ example: 1, description: 'ID of the applicable tax rate' })
  taxRateId?: number | null;

  @ApiPropertyOptional({ example: 5001, description: 'General Ledger account ID for this product' })
  accountId?: number | null;

  @ApiPropertyOptional({ example: 'https://example.com/images/chair.jpg', description: 'URL to the product image' })
  imageUrl?: string | null;

  @ApiPropertyOptional({ type: () => ProductCategory, description: 'Category this product belongs to' })
  category?: ProductCategory;

  @ApiPropertyOptional({ type: [ProductVariant], description: 'Variants of this product' })
  variants?: ProductVariant[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the product was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the product was last updated' })
  updatedAt: Date;
} 