import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItem {
  @ApiProperty({ description: 'Unique identifier', example: 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7' })
  id!: string;

  @ApiProperty({ description: 'Invoice ID', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  invoiceId!: string;

  @ApiPropertyOptional({ description: 'Item code or SKU', example: 'SKU-12345' })
  itemCode?: string;

  @ApiProperty({ description: 'Item description', example: 'Web Development Services' })
  description!: string;

  @ApiProperty({ description: 'Quantity', example: 5 })
  quantity!: number;

  @ApiProperty({ description: 'Unit price', example: 120.00 })
  unitPrice!: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10 })
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', example: 8.25 })
  taxPercentage?: number;

  @ApiProperty({ description: 'Line total (quantity * unitPrice)', example: 600.00 })
  lineTotal!: number;

  @ApiPropertyOptional({ description: 'Additional notes for this item' })
  notes?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt!: Date;
} 