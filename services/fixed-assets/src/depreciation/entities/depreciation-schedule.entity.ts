import { ApiProperty } from '@nestjs/swagger';
import { DepreciationEntry as PrismaDepreciationEntry } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class DepreciationEntryEntity implements PrismaDepreciationEntry {
  @ApiProperty({ description: 'Unique identifier of the depreciation entry' })
  id: string;

  @ApiProperty({ description: 'ID of the asset this entry belongs to' })
  assetId: string;

  @ApiProperty({ description: 'Date when this depreciation was recorded' })
  date: Date;
  
  @ApiProperty({ description: 'Amount of depreciation for this period' })
  amount: Decimal;
  
  @ApiProperty({ description: 'Remaining book value after this depreciation' })
  bookValue: Decimal;
  
  @ApiProperty({ description: 'Date when the entry was created' })
  createdAt: Date;
  
  @ApiProperty({ description: 'Date when the entry was last updated' })
  updatedAt: Date;
}

export class DepreciationScheduleEntity {
  @ApiProperty({ description: 'Asset ID that this schedule belongs to' })
  assetId: string;

  @ApiProperty({ description: 'Original cost of the asset' })
  originalCost: Decimal;

  @ApiProperty({ description: 'Residual value at the end of useful life' })
  residualValue: Decimal;

  @ApiProperty({ description: 'Total depreciable amount (original cost - residual value)' })
  depreciableAmount: Decimal;

  @ApiProperty({ description: 'Total accumulated depreciation to date' })
  accumulatedDepreciation: Decimal;

  @ApiProperty({ description: 'Current book value of the asset' })
  currentBookValue: Decimal;

  @ApiProperty({ description: 'Whether the asset is fully depreciated' })
  isFullyDepreciated: boolean;

  @ApiProperty({ description: 'List of depreciation entries that make up this schedule' })
  entries: DepreciationEntryEntity[];

  @ApiProperty({ description: 'Future depreciation schedule entries' })
  projectedEntries: {
    date: Date;
    amount: Decimal;
    bookValue: Decimal;
  }[];
} 