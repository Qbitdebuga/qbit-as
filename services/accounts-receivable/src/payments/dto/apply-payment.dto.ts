import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentId!: string;

  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amountApplied!: number;
} 