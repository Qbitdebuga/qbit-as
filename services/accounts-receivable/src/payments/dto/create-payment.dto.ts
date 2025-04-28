import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../../invoices/entities/payment-method.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string | null;

  @IsNotEmpty()
  @IsDateString()
  paymentDate!: string | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number | null;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
} 