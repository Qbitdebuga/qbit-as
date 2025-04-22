import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { StatementPeriod } from '@qbit/shared-types';

export class StatementRequestDto {
  @ApiProperty({
    description: 'Start date for the statement period',
    example: '2023-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the statement period',
    example: '2023-12-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Statement period type',
    enum: StatementPeriod,
    example: StatementPeriod.YEAR,
  })
  @IsEnum(StatementPeriod)
  period: StatementPeriod;

  @ApiProperty({
    description: 'Whether to include comparative data from previous period',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  comparativePeriod?: boolean = false;

  @ApiProperty({
    description: 'Whether to include accounts with zero balances',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeZeroBalances?: boolean = false;
} 