import { ApiProperty } from '@nestjs/swagger';
import { Asset as PrismaAsset, AssetStatus, DepreciationMethod } from '@prisma/client';
import { AssetCategoryEntity } from './asset-category.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class AssetEntity implements PrismaAsset {
  @ApiProperty({ description: 'Unique identifier of the asset' })
  id: string;

  @ApiProperty({ description: 'Name of the asset' })
  name: string;

  @ApiProperty({ description: 'Description of the asset', required: false })
  description: string | null;

  @ApiProperty({ description: 'Unique asset number for tracking' })
  assetNumber: string;

  @ApiProperty({ description: 'Date when the asset was purchased' })
  purchaseDate: Date;

  @ApiProperty({ description: 'Original cost of the asset' })
  purchaseCost: Decimal;

  @ApiProperty({ description: 'Estimated residual value at the end of useful life' })
  residualValue: Decimal;

  @ApiProperty({ description: 'Expected useful life in years' })
  assetLifeYears: number;

  @ApiProperty({ 
    description: 'Current status of the asset',
    enum: AssetStatus
  })
  status: AssetStatus;

  @ApiProperty({ description: 'Serial number of the asset', required: false })
  serialNumber: string | null;

  @ApiProperty({ description: 'Physical location of the asset', required: false })
  location: string | null;

  @ApiProperty({ description: 'Additional notes about the asset', required: false })
  notes: string | null;

  @ApiProperty({ description: 'Date when the asset was created in the system' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the asset was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID of the category this asset belongs to' })
  categoryId: string;

  @ApiProperty({ 
    description: 'Method used to calculate depreciation',
    enum: DepreciationMethod
  })
  depreciationMethod: DepreciationMethod;

  // Non-database properties
  @ApiProperty({ type: AssetCategoryEntity, required: false })
  category?: AssetCategoryEntity;

  @ApiProperty({ description: 'Current book value of the asset', required: false })
  currentBookValue?: Decimal;

  @ApiProperty({ description: 'Total accumulated depreciation', required: false })
  accumulatedDepreciation?: Decimal;

  constructor(partial: Partial<AssetEntity>) {
    Object.assign(this, partial);
  }
} 