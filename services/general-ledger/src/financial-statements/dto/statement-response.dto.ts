import { ApiProperty } from '@nestjs/swagger';
import { StatementPeriod } from '@qbit/shared-types';

export class StatementMetaDto {
  @ApiProperty({
    description: 'Title of the financial statement',
    example: 'Balance Sheet',
  })
  title: string | null;

  @ApiProperty({
    description: 'Type of financial report',
    example: 'BALANCE_SHEET',
  })
  reportType: string | null;

  @ApiProperty({
    description: 'Start date of the reporting period',
    example: '2023-01-01',
  })
  startDate: string | null;

  @ApiProperty({
    description: 'End date of the reporting period',
    example: '2023-12-31',
  })
  endDate: string | null;

  @ApiProperty({
    description: 'Date and time when the report was generated',
    example: '2023-12-31T23:59:59Z',
  })
  generatedAt: string | null;

  @ApiProperty({
    description: 'Period type of the report',
    enum: StatementPeriod,
    example: StatementPeriod.YEAR,
  })
  period: StatementPeriod;

  @ApiProperty({
    description: 'Whether comparative data is included',
    example: true,
    required: false,
  })
  comparativePeriod?: boolean | null;

  @ApiProperty({ description: 'Total number of accounts' })
  totalAccounts: number = 0;

  @ApiProperty({ description: 'Currency used in the statement' })
  currency: string = 'USD';
}

export class StatementResponseDto {
  @ApiProperty({ description: 'Title of the financial statement' })
  title!: string | null;

  @ApiProperty({ description: 'Type of the financial report' })
  reportType!: string | null;

  @ApiProperty({ description: 'Start date of the statement period' })
  startDate!: string | null;

  @ApiProperty({ description: 'End date of the statement period' })
  endDate!: string | null;

  @ApiProperty({ description: 'Date when the statement was generated' })
  generatedAt!: string | null;

  @ApiProperty({
    description: 'Period type of the statement',
    enum: StatementPeriod,
  })
  period!: StatementPeriod;

  @ApiProperty({
    description: 'Content of the financial statement',
    type: 'object',
  })
  data: Record<string, any> = {};

  @ApiProperty({
    description: 'Comparative data from previous period (if requested)',
    type: 'object',
    required: false,
  })
  comparativeData?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata about the statement' })
  meta: StatementMetaDto = new StatementMetaDto();
  
  constructor(partial: Partial<StatementResponseDto>) {
    Object.assign(this, partial);
  }
} 