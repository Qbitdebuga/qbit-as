import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { AssetStatus } from '../enums/asset-status.enum';
import { DepreciationMethod } from '../../depreciation/enums/depreciation-method.enum';

export class UpdateAssetDto {
  @ApiProperty({ description: 'Name of the asset', required: false })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({ description: 'Description of the asset', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Unique asset number for tracking', required: false })
  @IsString()
  @IsOptional()
  assetNumber?: string | null;

  @ApiProperty({ description: 'Date when the asset was purchased', required: false })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string | null;

  @ApiProperty({ description: 'Original cost of the asset', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  purchaseCost?: number | null;

  @ApiProperty({
    description: 'Estimated residual value at the end of useful life',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @ValidateIf((o) => o.residualValue !== undefined)
  @Min(0)
  @IsOptional()
  residualValue?: number | null;

  @ApiProperty({ description: 'Expected useful life in years', required: false })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  assetLifeYears?: number | null;

  @ApiProperty({
    description: 'Current status of the asset',
    enum: AssetStatus,
    required: false,
  })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiProperty({ description: 'Serial number of the asset', required: false })
  @IsString()
  @IsOptional()
  serialNumber?: string | null;

  @ApiProperty({ description: 'Physical location of the asset', required: false })
  @IsString()
  @IsOptional()
  location?: string | null;

  @ApiProperty({ description: 'Additional notes about the asset', required: false })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({ description: 'ID of the category this asset belongs to', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @ApiProperty({
    description: 'Method used to calculate depreciation',
    enum: DepreciationMethod,
    required: false,
  })
  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;
}
