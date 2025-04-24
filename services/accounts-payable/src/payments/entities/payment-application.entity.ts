import { ApiProperty } from '@nestjs/swagger';

export class PaymentApplication {
  @ApiProperty({ description: 'The unique identifier of the payment application' })
  id: number;

  @ApiProperty({ description: 'The ID of the payment this application belongs to' })
  paymentId: number;

  @ApiProperty({ description: 'The ID of the bill being paid' })
  billId: number;

  @ApiProperty({ 
    description: 'The amount applied to the bill', 
    example: 500.00
  })
  amount: number;

  @ApiProperty({ description: 'The date when the payment application was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the payment application was last updated' })
  updatedAt: Date;
} 