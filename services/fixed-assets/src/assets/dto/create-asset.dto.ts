import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsDateString, 
  IsNumber, 
  IsEnum, 
  IsUUID, 
  Min, 
  IsPositive,
  ValidateIf
} from 'class-validator';
import { AssetStatus } from '../enums/asset-status.enum';
import { DepreciationMethod } from '../../depreciation/enums/depreciation-method.enum';

export class CreateAssetDto {
  @ApiProperty({ description: 'Name of the asset' })
  @IsString()
  @IsNotEmpty()
  name: string | null;

  @ApiProperty({ description: 'Description of the asset', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Unique asset number for tracking' })
  @IsString()
  @IsNotEmpty()
  assetNumber: string | null;

  @ApiProperty({ description: 'Date when the asset was purchased' })
  @IsDateString()
  purchaseDate: string | null;

  @ApiProperty({ description: 'Original cost of the asset' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  purchaseCost: number | null;

  @ApiProperty({ description: 'Estimated residual value at the end of useful life' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @ValidateIf(o => o.residualValue !== undefined)
  @Min(0)
  residualValue: number = 0;

  @ApiProperty({ description: 'Expected useful life in years' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  assetLifeYears: number | null;

  @ApiProperty({ 
    description: 'Current status of the asset',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE 
  })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus = AssetStatus.ACTIVE;

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

  @ApiProperty({ description: 'ID of the category this asset belongs to' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string | null;

  @ApiProperty({ 
    description: 'Method used to calculate depreciation',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE 
  })
  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod = DepreciationMethod.STRAIGHT_LINE;
} 