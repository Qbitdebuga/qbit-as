import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from './product-category.entity.js';
import { ProductVariant } from './product-variant.entity.js';

export class Product {
  @ApiProperty({ example: 1, description: 'Unique identifier for the product' })
  id: number;

  @ApiProperty({ example: 'PROD-001', description: 'Stock Keeping Unit, unique identifier' })
  sku: string;

  @ApiProperty({ example: 'Office Chair', description: 'Name of the product' })
  name: string;

  @ApiPropertyOptional({ example: 'Ergonomic office chair with adjustable height', description: 'Detailed description of the product' })
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID of the category this product belongs to' })
  categoryId?: number;

  @ApiProperty({ example: 199.99, description: 'Selling price of the product' })
  price: number;

  @ApiPropertyOptional({ example: 120.00, description: 'Cost price of the product' })
  cost?: number;

  @ApiProperty({ example: 15, description: 'Current quantity in stock', default: 0 })
  quantityOnHand: number;

  @ApiPropertyOptional({ example: 5, description: 'Level at which to reorder the product' })
  reorderPoint?: number;

  @ApiProperty({ example: true, description: 'Whether the product is active', default: true })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Whether the product can be sold', default: true })
  isSellable: boolean;

  @ApiProperty({ example: true, description: 'Whether the product can be purchased', default: true })
  isPurchasable: boolean;

  @ApiPropertyOptional({ example: '123456789012', description: 'Barcode for the product' })
  barcode?: string;

  @ApiPropertyOptional({ example: 5.2, description: 'Weight of the product' })
  weight?: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Unit of weight measurement' })
  weightUnit?: string;

  @ApiPropertyOptional({ example: '{"length": 60, "width": 60, "height": 120, "unit": "cm"}', description: 'Dimensions of the product in JSON format' })
  dimensions?: string;

  @ApiProperty({ example: true, description: 'Whether the product is taxable', default: true })
  taxable: boolean;

  @ApiPropertyOptional({ example: 1, description: 'ID of the applicable tax rate' })
  taxRateId?: number;

  @ApiPropertyOptional({ example: 5001, description: 'General Ledger account ID for this product' })
  accountId?: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/chair.jpg', description: 'URL to the product image' })
  imageUrl?: string;

  @ApiPropertyOptional({ type: () => ProductCategory, description: 'Category this product belongs to' })
  category?: ProductCategory;

  @ApiPropertyOptional({ type: [ProductVariant], description: 'Variants of this product' })
  variants?: ProductVariant[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the product was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the product was last updated' })
  updatedAt: Date;
} 