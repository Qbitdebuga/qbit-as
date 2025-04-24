import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUUID, 
  Min, 
  ValidateNested 
} from 'class-validator';
import { InvoiceStatus } from '../entities/invoice-status.enum';

export class CreateInvoiceItemDto {
  @ApiPropertyOptional({ description: 'Item code or SKU', example: 'SKU-12345' })
  @IsOptional()
  @IsString()
  itemCode?: string;

  @ApiProperty({ description: 'Item description', example: 'Web Development Services' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 120.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', example: 8.25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Additional notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer ID', example: 'c7fb7b8a-b35d-4d5f-a766-78364b5ac1ff' })
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ description: 'Customer reference number', example: 'PO-12345' })
  @IsOptional()
  @IsString()
  customerReference?: string;

  @ApiProperty({ description: 'Invoice date', example: '2023-01-15' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  invoiceDate: Date;

  @ApiProperty({ description: 'Due date', example: '2023-02-15' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({ 
    description: 'Invoice status', 
    enum: InvoiceStatus, 
    default: InvoiceStatus.DRAFT,
    example: InvoiceStatus.DRAFT 
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus = InvoiceStatus.DRAFT;

  @ApiPropertyOptional({ description: 'Notes', example: 'Payment due within 30 days' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ description: 'Invoice items', type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
} 