import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentId!: string | null;

  @IsNotEmpty()
  @IsString()
  invoiceId!: string | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amountApplied!: number | null;
} 