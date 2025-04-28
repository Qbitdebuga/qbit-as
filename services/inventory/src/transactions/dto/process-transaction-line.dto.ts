import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionLineStatus } from './create-transaction-line.dto';

export class ProcessTransactionLineDto {
  @ApiProperty({
    description: 'The ID of the transaction line',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string | null;

  @ApiProperty({
    description: 'Quantity being processed',
    example: 10.5
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  processedQuantity: number | null;

  @ApiPropertyOptional({
    enum: TransactionLineStatus,
    description: 'New status for the transaction line',
    example: TransactionLineStatus.COMPLETE
  })
  @IsEnum(TransactionLineStatus)
  @IsOptional()
  status?: TransactionLineStatus;

  @ApiPropertyOptional({
    description: 'Notes about the processing',
    example: 'Items received with minor damage'
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'Lot number for tracking',
    example: 'LOT-ABC-123'
  })
  @IsString()
  @IsOptional()
  lotNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Serial number for tracking',
    example: 'SN-12345'
  })
  @IsString()
  @IsOptional()
  serialNumber?: string | null;
} 