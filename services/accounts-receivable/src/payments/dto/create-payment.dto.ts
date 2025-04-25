import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../../invoices/entities/payment-method.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsDateString()
  paymentDate!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 