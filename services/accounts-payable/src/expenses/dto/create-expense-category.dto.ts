import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({
    example: 'Office Supplies',
    description: 'Name of the expense category',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string | null;

  @ApiPropertyOptional({
    example: 'Expenses related to office supplies and stationery',
    description: 'Description of the expense category',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({
    example: 5001,
    description: 'ID of the accounting system account associated with this category',
  })
  @IsNumber()
  @IsOptional()
  accountId?: number | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this category is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;
} 