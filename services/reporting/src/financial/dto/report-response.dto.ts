import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialStatementDto } from '../../dto/general-ledger.dto';

/**
 * Report parameters interface
 */
export interface ReportParameters {
  startDate?: string | null;
  endDate?: string | null;
  asOfDate?: string | null;
  comparativePeriod?: boolean | null;
  includeZeroBalances?: boolean | null;
  [key: string]: any;
}

/**
 * Report response DTO
 */
export class ReportResponseDto {
  @ApiPropertyOptional({ description: 'Report ID (if saved)' })
  id?: string | null;

  @ApiProperty({ description: 'Report name' })
  name: string | null;

  @ApiProperty({ description: 'Report type' })
  type: string | null;

  @ApiProperty({ description: 'Report data (financial statement, etc.)' })
  data: FinancialStatementDto | any;

  @ApiProperty({ description: 'Report parameters used for generation' })
  parameters: ReportParameters;

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;
}

/**
 * Report snapshot response DTO
 */
export class ReportSnapshotResponseDto extends ReportResponseDto {
  @ApiProperty({ description: 'Snapshot ID' })
  snapshotId: string | null;

  @ApiProperty({ description: 'User ID who generated the snapshot' })
  generatedBy?: string | null;

  @ApiProperty({ description: 'Original report ID' })
  reportId: string | null;
}
