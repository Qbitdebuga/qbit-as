import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment-method.enum';

export class CreateInvoicePaymentDto {
  @ApiProperty({ description: 'Invoice ID', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  @IsNotEmpty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ description: 'Payment date', example: '2023-02-10' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ 
    description: 'Payment method', 
    enum: PaymentMethod, 
    example: PaymentMethod.CREDIT_CARD 
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Reference number (check #, transaction ID, etc.)', example: 'TXN-987654321' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Additional notes about payment', example: 'Partial payment received' })
  @IsOptional()
  @IsString()
  notes?: string;
} 