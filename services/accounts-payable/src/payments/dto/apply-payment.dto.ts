import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsNotEmpty, 
  IsNumber, 
  IsPositive, 
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { CreatePaymentApplicationDto } from './create-payment.dto.js';

export class ApplyPaymentDto {
  @ApiProperty({
    description: 'ID of the payment to apply',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  paymentId: number;

  @ApiProperty({
    description: 'List of bill applications',
    type: [CreatePaymentApplicationDto]
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentApplicationDto)
  @IsArray()
  @ArrayMinSize(1)
  applications: CreatePaymentApplicationDto[];
} 