import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class TransactionLineEntity {
  @ApiProperty({ description: 'Unique identifier for the transaction line' })
  id: string;

  @ApiProperty({ description: 'ID of the parent transaction' })
  transactionId: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  productId: number | null;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  variantId: number | null;

  @ApiPropertyOptional({ description: 'Source location ID for transfers' })
  sourceLocationId: number | null;

  @ApiPropertyOptional({ description: 'Target location ID' })
  targetLocationId: number | null;

  @ApiProperty({ description: 'Expected quantity to be processed' })
  expectedQuantity: Decimal;

  @ApiProperty({ description: 'Quantity that has been processed' })
  processedQuantity: Decimal;

  @ApiProperty({ description: 'Status of the transaction line (pending, partial, complete, cancelled)' })
  status: string;

  @ApiPropertyOptional({ description: 'Notes about the transaction line' })
  notes: string | null;

  @ApiPropertyOptional({ description: 'Lot number for tracking' })
  lotNumber: string | null;

  @ApiPropertyOptional({ description: 'Serial number for tracking' })
  serialNumber: string | null;

  @ApiPropertyOptional({ description: 'Expiration date' })
  expirationDate: Date | null;

  @ApiPropertyOptional({ description: 'Unit cost for the item' })
  unitCost: Decimal | null;

  @ApiProperty({ description: 'When the transaction line was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the transaction line was last updated' })
  updatedAt: Date;
} 