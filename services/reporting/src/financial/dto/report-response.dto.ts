import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialStatementDto } from '../../dto/general-ledger.dto';

/**
 * Report parameters interface
 */
export interface ReportParameters {
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  comparativePeriod?: boolean;
  includeZeroBalances?: boolean;
  [key: string]: any;
}

/**
 * Report response DTO
 */
export class ReportResponseDto {
  @ApiPropertyOptional({ description: 'Report ID (if saved)' })
  id?: string;

  @ApiProperty({ description: 'Report name' })
  name: string;

  @ApiProperty({ description: 'Report type' })
  type: string;

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
  snapshotId: string;

  @ApiProperty({ description: 'User ID who generated the snapshot' })
  generatedBy?: string;

  @ApiProperty({ description: 'Original report ID' })
  reportId: string;
} 