import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTransactionLineDto } from './update-transaction-line.dto';

export class UpdateTransactionDto extends PartialType(
  OmitType(CreateTransactionDto, ['lines'] as const)
) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransactionLineDto)
  lines?: UpdateTransactionLineDto[];
} 