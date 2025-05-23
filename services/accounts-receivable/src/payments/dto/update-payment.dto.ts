import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../invoices/entities/payment-status.enum.js';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
} 