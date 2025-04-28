import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillLineItem {
  @ApiProperty({ description: 'The unique identifier of the line item' })
  id: number | null;

  @ApiProperty({ description: 'The ID of the bill this line item belongs to' })
  billId: number | null;

  @ApiProperty({ description: 'Description of the product or service', example: 'Office Supplies' })
  description: string | null;

  @ApiProperty({ description: 'The account ID for this expense', example: 5001 })
  accountId: number | null;

  @ApiProperty({ description: 'The quantity of the item', example: 5 })
  quantity: number | null;

  @ApiProperty({ description: 'The price per unit', example: 45.99 })
  unitPrice: number | null;

  @ApiProperty({ description: 'The total for this line (quantity * unitPrice)', example: 229.95 })
  amount: number | null;

  @ApiPropertyOptional({ description: 'The discount percentage applied to this item', example: 10 })
  discountPercent?: number | null;

  @ApiPropertyOptional({ description: 'The tax percentage applied to this item', example: 8.25 })
  taxPercent?: number | null;

  @ApiPropertyOptional({ description: 'Additional notes about this line item' })
  notes?: string | null;

  @ApiProperty({ description: 'The date when the line item was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the line item was last updated' })
  updatedAt: Date;
}
