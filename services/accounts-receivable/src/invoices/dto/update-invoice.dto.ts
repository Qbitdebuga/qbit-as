import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice-status.enum';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Customer reference number', example: 'PO-12345' })
  @IsOptional()
  @IsString()
  customerReference?: string;

  @ApiPropertyOptional({ description: 'Invoice date', example: '2023-01-15' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invoiceDate?: Date;

  @ApiPropertyOptional({ description: 'Due date', example: '2023-02-15' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Invoice status', 
    enum: InvoiceStatus,
    example: InvoiceStatus.SENT 
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Notes', example: 'Payment due within 30 days' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;
} 