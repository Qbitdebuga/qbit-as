import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, IsNumber, IsOptional, 
  IsPositive, IsString, IsUUID, MaxLength, Min
} from 'class-validator';

export class CreateBillLineItemDto {
  @ApiProperty({
    example: 'Professional Services',
    description: 'Description of the item or service',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string | null;

  @ApiProperty({
    example: 1,
    description: 'Quantity of items',
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  quantity: number | null;

  @ApiProperty({
    example: 500.00,
    description: 'Unit price of the item',
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  unitPrice: number | null;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'ID of the account to which this expense is allocated',
  })
  @IsUUID()
  @IsOptional()
  accountId?: string | null;

  @ApiPropertyOptional({
    example: 'IT-EXP',
    description: 'Account code for this line item',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  accountCode?: string | null;

  @ApiPropertyOptional({
    example: 10.00,
    description: 'Tax rate applied to this line item (percentage)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number | null;
} 