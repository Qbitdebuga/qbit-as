import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment-method.enum';
import { PaymentStatus } from '../entities/payment-status.enum';

export class CreateInvoicePaymentDto {
  @ApiProperty({ description: 'Invoice ID', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  @IsNotEmpty()
  @IsUUID()
  invoiceId!: string | null;

  @ApiProperty({ description: 'Payment date', example: '2023-02-10T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate!: Date;

  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number | null;

  @ApiProperty({ 
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Payment status',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
    example: PaymentStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus = PaymentStatus.COMPLETED;

  @ApiPropertyOptional({ description: 'Reference/transaction number', example: 'TRX-123456' })
  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string | null;
} 