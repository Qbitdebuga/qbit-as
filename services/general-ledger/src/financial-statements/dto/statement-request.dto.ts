import { IsEnum, IsDateString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatementPeriod } from '@qbit/shared-types';

export class StatementRequestDto {
  @ApiProperty({
    description: 'Start date for the statement period (format: YYYY-MM-DD)',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string | null;

  @ApiProperty({
    description: 'End date for the statement period (format: YYYY-MM-DD)',
    example: '2023-12-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string | null;

  @ApiProperty({
    description: 'Period type for the statement',
    enum: StatementPeriod,
    example: StatementPeriod.YEAR,
  })
  @IsEnum(StatementPeriod)
  @IsNotEmpty()
  period!: StatementPeriod;

  @ApiProperty({
    description: 'Include comparison with previous period',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeComparison?: boolean = false;
  
  @ApiProperty({
    description: 'Comparative period data for the statement',
    required: false,
  })
  @IsOptional()
  comparativePeriod?: any;

  @ApiProperty({
    description: 'Whether to include accounts with zero balances',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeZeroBalances?: boolean = false;
} 