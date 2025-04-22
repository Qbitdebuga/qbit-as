import { ApiProperty } from '@nestjs/swagger';
import { StatementPeriod } from '@qbit/shared-types';

export class StatementMetaDto {
  @ApiProperty({
    description: 'Title of the financial statement',
    example: 'Balance Sheet',
  })
  title: string;

  @ApiProperty({
    description: 'Type of financial report',
    example: 'BALANCE_SHEET',
  })
  reportType: string;

  @ApiProperty({
    description: 'Start date of the reporting period',
    example: '2023-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of the reporting period',
    example: '2023-12-31',
  })
  endDate: string;

  @ApiProperty({
    description: 'Date and time when the report was generated',
    example: '2023-12-31T23:59:59Z',
  })
  generatedAt: string;

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
  comparativePeriod?: boolean;
}

export class StatementResponseDto {
  @ApiProperty({
    description: 'Metadata about the financial statement',
    type: StatementMetaDto,
  })
  meta: StatementMetaDto;

  @ApiProperty({
    description: 'Financial statement data',
    example: {},
  })
  data: any;
} 