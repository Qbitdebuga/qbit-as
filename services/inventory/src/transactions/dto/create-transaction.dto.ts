import { IsArray, IsBoolean, IsDate, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateTransactionLineDto } from './create-transaction-line.dto.js';

export enum TransactionType {
  RECEIPT = 'receipt',
  SHIPMENT = 'shipment',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  COUNT = 'count'
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, description: 'Type of transaction' })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ required: false, description: 'External reference number (e.g., PO number, SO number)' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiProperty({ required: false, description: 'Type of document this is referencing (e.g., "purchase_order", "sales_order")' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ required: false, description: 'ID of the referenced document' })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ required: false, description: 'Source warehouse ID (required for transfers)' })
  @IsUUID()
  @IsOptional()
  sourceWarehouseId?: string;

  @ApiProperty({ description: 'Target warehouse ID (required for all except adjustments)' })
  @IsUUID()
  targetWarehouseId: string;

  @ApiProperty({ required: false, description: 'Transaction date', type: Date, default: new Date() })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  transactionDate?: Date;

  @ApiProperty({ required: false, description: 'Transaction notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false, description: 'Is the transaction backordered', default: false })
  @IsBoolean()
  @IsOptional()
  isBackordered?: boolean;

  @ApiProperty({ type: [CreateTransactionLineDto], description: 'Transaction line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionLineDto)
  lines: CreateTransactionLineDto[];
} 