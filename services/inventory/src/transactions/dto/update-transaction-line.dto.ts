import { PartialType } from '@nestjs/swagger';
import { CreateTransactionLineDto } from './create-transaction-line.dto.js';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateTransactionLineDto extends PartialType(CreateTransactionLineDto) {
  @IsUUID()
  @IsOptional()
  id?: string;
} 