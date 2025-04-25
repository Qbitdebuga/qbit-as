import { ApiProperty } from '@nestjs/swagger';

export class BankEntity {
  @ApiProperty({ description: 'Unique identifier of the bank' })
  id: string;

  @ApiProperty({ description: 'Name of the bank', example: 'Chase Bank' })
  name: string;

  @ApiProperty({ description: 'Unique bank code', example: 'CHASE' })
  code: string;

  @ApiProperty({
    description: 'Bank routing number',
    example: '021000021',
    required: false,
  })
  routingNumber: string | null;

  @ApiProperty({
    description: 'SWIFT/BIC code for international transfers',
    example: 'CHASUS33',
    required: false,
  })
  swiftCode: string | null;

  @ApiProperty({
    description: 'Bank address',
    example: '270 Park Avenue, New York, NY 10172',
    required: false,
  })
  address: string | null;

  @ApiProperty({
    description: 'Bank contact person name',
    example: 'John Smith',
    required: false,
  })
  contactName: string | null;

  @ApiProperty({
    description: 'Bank contact phone number',
    example: '+1-212-555-1234',
    required: false,
  })
  contactPhone: string | null;

  @ApiProperty({
    description: 'Bank contact email address',
    example: 'support@chase.com',
    required: false,
  })
  contactEmail: string | null;

  @ApiProperty({
    description: 'Bank website URL',
    example: 'https://www.chase.com',
    required: false,
  })
  website: string | null;

  @ApiProperty({
    description: 'Additional notes about the bank',
    example: 'Primary business banking institution',
    required: false,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Whether the bank is active in the system',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({ description: 'Date when the bank was created in the system' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the bank was last updated' })
  updatedAt: Date;
} 