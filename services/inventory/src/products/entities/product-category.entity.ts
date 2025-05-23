import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity.js';

export class ProductCategory {
  @ApiProperty({ example: 1, description: 'Unique identifier for the category' })
  id: number;

  @ApiProperty({ example: 'Office Furniture', description: 'Name of the category' })
  name: string;

  @ApiPropertyOptional({ example: 'All office furniture products', description: 'Description of the category' })
  description?: string;

  @ApiPropertyOptional({ example: 5, description: 'ID of the parent category, if this is a subcategory' })
  parentId?: number;

  @ApiProperty({ example: true, description: 'Whether the category is active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/images/office-furniture.jpg', description: 'URL to the category image' })
  imageUrl?: string;

  @ApiPropertyOptional({ type: () => ProductCategory, description: 'Parent category, if this is a subcategory' })
  parent?: ProductCategory;

  @ApiPropertyOptional({ type: [ProductCategory], description: 'Child categories' })
  children?: ProductCategory[];

  @ApiPropertyOptional({ type: [Product], description: 'Products in this category' })
  products?: Product[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the category was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the category was last updated' })
  updatedAt: Date;
} 