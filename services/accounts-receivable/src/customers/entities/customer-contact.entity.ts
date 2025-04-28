import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerContact {
  @ApiProperty({ description: 'Unique identifier', example: 'f6g7-h8i9-j0k1-l2m3' })
  id!: string | null;

  @ApiProperty({ description: 'Customer ID', example: 'e5f6-g7h8-i9j0-k1l2' })
  customerId!: string | null;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName!: string | null;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName!: string | null;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@acme.com' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Phone number', example: '555-987-6543' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Position/title', example: 'Purchasing Manager' })
  position?: string | null;

  @ApiProperty({ description: 'Is primary contact', default: false })
  isPrimary!: boolean | null;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt!: Date;
} 