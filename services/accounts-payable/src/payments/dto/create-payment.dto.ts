import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsDateString, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsPositive, 
  IsString, 
  IsUUID, 
  ValidateNested, 
  ArrayMinSize 
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity.js';

export class CreatePaymentApplicationDto {
  @ApiProperty({
    description: 'ID of the bill to apply payment to',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  billId: number;

  @ApiProperty({
    description: 'Amount to apply to this bill',
    example: 500.00
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Payment number (will be auto-generated if not provided)',
    example: 'PAY-00001'
  })
  @IsString()
  @IsOptional()
  paymentNumber?: string;

  @ApiProperty({
    description: 'ID of the vendor receiving payment',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @ApiProperty({
    description: 'Date of payment',
    example: '2023-06-15'
  })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({
    description: 'Total payment amount',
    example: 1000.00
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Reference number (check number, transaction ID, etc.)',
    example: 'CHK-12345'
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Memo or notes about the payment',
    example: 'Payment for June invoices'
  })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({
    description: 'Status of the payment',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus = PaymentStatus.PENDING;

  @ApiPropertyOptional({
    description: 'ID of the bank account used for the payment',
    example: 1
  })
  @IsNumber()
  @IsOptional()
  bankAccountId?: number;

  @ApiProperty({
    description: 'Bill payment applications',
    type: [CreatePaymentApplicationDto]
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentApplicationDto)
  @ArrayMinSize(1)
  @IsArray()
  applications: CreatePaymentApplicationDto[];
} 