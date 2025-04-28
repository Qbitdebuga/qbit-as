import { ApiProperty } from '@nestjs/swagger';

export class PaymentApplication {
  @ApiProperty({ description: 'The unique identifier of the payment application' })
  id: number | null;

  @ApiProperty({ description: 'The ID of the payment this application belongs to' })
  paymentId: number | null;

  @ApiProperty({ description: 'The ID of the bill being paid' })
  billId: number | null;

  @ApiProperty({
    description: 'The amount applied to the bill',
    example: 500.0,
  })
  amount: number | null;

  @ApiProperty({ description: 'The date when the payment application was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the payment application was last updated' })
  updatedAt: Date;
}
