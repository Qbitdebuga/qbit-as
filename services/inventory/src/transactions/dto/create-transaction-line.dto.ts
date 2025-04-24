import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsInt, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsISO8601, 
  IsPositive,
  Min, 
  IsUUID,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionLineStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled'
}

export class CreateTransactionLineDto {
  @ApiPropertyOptional({ 
    description: 'Product ID',
    example: 1
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  productId?: number;

  @ApiPropertyOptional({ 
    description: 'Product variant ID',
    example: 1
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  variantId?: number;

  @ApiPropertyOptional({ 
    description: 'Source location ID for transfers',
    example: 1
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  sourceLocationId?: number;

  @ApiPropertyOptional({ 
    description: 'Target location ID',
    example: 2
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  targetLocationId?: number;

  @ApiProperty({ 
    description: 'Expected quantity to be processed',
    example: 10.5
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  expectedQuantity: number;

  @ApiPropertyOptional({ 
    description: 'Quantity that has been processed',
    example: 5.0,
    default: 0
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  processedQuantity?: number;

  @ApiPropertyOptional({ 
    enum: TransactionLineStatus, 
    description: 'Status of the transaction line',
    example: TransactionLineStatus.PENDING,
    default: TransactionLineStatus.PENDING
  })
  @IsEnum(TransactionLineStatus)
  @IsOptional()
  status?: TransactionLineStatus;

  @ApiPropertyOptional({ 
    description: 'Notes about the transaction line',
    example: 'Items are in good condition'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Lot number for tracking',
    example: 'LOT-ABC-123'
  })
  @IsString()
  @IsOptional()
  lotNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Serial number for tracking',
    example: 'SN-12345'
  })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Expiration date',
    example: '2024-12-31T00:00:00Z'
  })
  @IsISO8601()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({ 
    description: 'Unit cost for the item',
    example: 15.99
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitCost?: number;
} 