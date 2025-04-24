import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerContact {
  @ApiProperty({ description: 'Unique identifier', example: 'f8d7e6c5-b4a3-c2b1-d0e9-f8d7e6c5b4a3' })
  id: string;

  @ApiProperty({ description: 'Customer ID this contact belongs to', example: 'c7fb7b8a-b35d-4d5f-a766-78364b5ac1ff' })
  customerId: string;

  @ApiProperty({ description: 'Contact first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Contact last name', example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Contact email', example: 'john.doe@acme.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '555-987-6543' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Contact position/title', example: 'Purchasing Manager' })
  position?: string;

  @ApiProperty({ description: 'Is primary contact', default: false })
  isPrimary: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;
} 