import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from './create-transaction.dto';
import { ProcessTransactionLineDto } from './process-transaction-line.dto';

export class ProcessTransactionDto {
  @ApiProperty({
    enum: TransactionStatus,
    description: 'New status for the transaction',
    example: TransactionStatus.COMPLETED
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Notes about the processing',
    example: 'All items received in good condition'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: [ProcessTransactionLineDto],
    description: 'Transaction lines to process'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessTransactionLineDto)
  lines: ProcessTransactionLineDto[];
} 