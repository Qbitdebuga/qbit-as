import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  BALANCE_SHEET = 'BALANCE_SHEET',
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  CASH_FLOW = 'CASH_FLOW',
  TRIAL_BALANCE = 'TRIAL_BALANCE',
}

export class ReportRequestDto {
  @ApiProperty({ enum: ReportType, description: 'Type of financial report to generate' })
  @IsEnum(ReportType)
  type: string | null;

  @ApiPropertyOptional({ description: 'Custom name for the report' })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiPropertyOptional({ description: 'Start date for period-based reports (ISO format)' })
  @IsISO8601()
  @IsOptional()
  startDate?: string | null;

  @ApiPropertyOptional({ description: 'End date for period-based reports (ISO format)' })
  @IsISO8601()
  @IsOptional()
  endDate?: string | null;

  @ApiPropertyOptional({ description: 'Specific date for point-in-time reports (ISO format)' })
  @IsISO8601()
  @IsOptional()
  asOfDate?: string | null;

  @ApiPropertyOptional({ description: 'Include comparative period data' })
  @IsBoolean()
  @IsOptional()
  comparativePeriod?: boolean | null;

  @ApiPropertyOptional({ description: 'Include accounts with zero balances' })
  @IsBoolean()
  @IsOptional()
  includeZeroBalances?: boolean | null;

  @ApiPropertyOptional({ description: 'Whether to save the report in the database' })
  @IsBoolean()
  @IsOptional()
  saveReport?: boolean | null;

  @ApiPropertyOptional({ description: 'User ID of the report creator' })
  @IsUUID()
  @IsOptional()
  userId?: string | null;
}
