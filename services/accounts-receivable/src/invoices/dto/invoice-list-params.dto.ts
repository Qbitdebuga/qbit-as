import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsDate, 
  IsEnum, 
  IsInt, 
  IsOptional, 
  IsString, 
  IsUUID,
  Min
} from 'class-validator';
import { InvoiceStatus } from '../entities/invoice-status.enum.js';

export class InvoiceListParamsDto {
  @ApiPropertyOptional({ description: 'Customer ID filter', example: 'c7fb7b8a-b35d-4d5f-a766-78364b5ac1ff' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ 
    description: 'Invoice status filter', 
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Start date for invoice date range', example: '2023-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for invoice date range', example: '2023-12-31' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Search term for invoice number or customer reference', example: 'INV-00001' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Field to sort by', 
    example: 'invoiceDate',
    default: 'invoiceDate'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'invoiceDate';

  @ApiPropertyOptional({ 
    description: 'Sort direction', 
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc'] 
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'desc';
} 