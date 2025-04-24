import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionLineEntity } from './transaction-line.entity';

export class InventoryTransactionEntity {
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  id: string;

  @ApiProperty({ description: 'Type of inventory transaction (receipt, shipment, transfer, adjustment, count)' })
  transactionType: string;

  @ApiPropertyOptional({ description: 'External reference number (e.g., PO number, SO number)' })
  referenceNumber: string | null;

  @ApiPropertyOptional({ description: 'Type of document this is referencing' })
  referenceType: string | null;

  @ApiPropertyOptional({ description: 'ID of the referenced document' })
  referenceId: string | null;

  @ApiPropertyOptional({ description: 'Source warehouse ID for transfers' })
  sourceWarehouseId: string | null;

  @ApiPropertyOptional({ description: 'Target warehouse ID' })
  targetWarehouseId: string | null;

  @ApiProperty({ description: 'Date of the transaction' })
  transactionDate: Date;

  @ApiProperty({ description: 'Status of the transaction (draft, pending, completed, cancelled)' })
  status: string;

  @ApiPropertyOptional({ description: 'Notes about the transaction' })
  notes: string | null;

  @ApiProperty({ description: 'Whether items are on backorder' })
  isBackordered: boolean;

  @ApiPropertyOptional({ description: 'User who created the transaction' })
  createdBy: string | null;

  @ApiPropertyOptional({ description: 'User who completed the transaction' })
  completedBy: string | null;

  @ApiPropertyOptional({ description: 'User who cancelled the transaction' })
  cancelledBy: string | null;

  @ApiPropertyOptional({ description: 'Date when the transaction was completed' })
  completedAt: Date | null;

  @ApiPropertyOptional({ description: 'Date when the transaction was cancelled' })
  cancelledAt: Date | null;

  @ApiProperty({ description: 'When the transaction was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the transaction was last updated' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: [TransactionLineEntity], description: 'Transaction line items' })
  lines?: TransactionLineEntity[];
} 