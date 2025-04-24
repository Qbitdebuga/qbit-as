import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, 
  IsPositive, IsString, MaxLength, ValidateNested, IsUUID, IsDateString, ArrayMinSize, Min, MinLength 
} from 'class-validator';
import { BillStatus } from './bill-status.enum';
import { CreateBillLineItemDto } from './create-bill-line-item.dto';

export class CreateBillDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the vendor the bill is from',
  })
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({
    example: 'INV-12345',
    description: 'Invoice number from the vendor',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  invoiceNumber: string;

  @ApiProperty({
    example: '2023-05-01',
    description: 'Date the bill was issued',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  issueDate: Date;

  @ApiProperty({
    example: '2023-05-31',
    description: 'Date the bill is due',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({
    example: BillStatus.DRAFT,
    description: 'Current status of the bill',
    enum: BillStatus,
    default: BillStatus.DRAFT,
  })
  @IsEnum(BillStatus)
  @IsOptional()
  status?: BillStatus = BillStatus.DRAFT;

  @ApiProperty({
    type: [CreateBillLineItemDto],
    description: 'Line items included in this bill',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillLineItemDto)
  @ArrayMinSize(1)
  lineItems: CreateBillLineItemDto[];

  @ApiPropertyOptional({
    example: 'Net 30 payment terms',
    description: 'Additional notes about the bill',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
} 