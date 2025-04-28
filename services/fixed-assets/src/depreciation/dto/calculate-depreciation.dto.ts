import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsDateString, 
  IsEnum, 
  IsNumber, 
  IsUUID, 
  IsBoolean 
} from 'class-validator';
import { DepreciationMethod } from '../enums/depreciation-method.enum';

export class CalculateDepreciationDto {
  @ApiProperty({ description: 'ID of the asset to calculate depreciation for' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string | null;

  @ApiProperty({ 
    description: 'Method to use for depreciation calculation',
    enum: DepreciationMethod,
    required: false 
  })
  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @ApiProperty({ 
    description: 'End date for the depreciation calculation period',
    required: false
  })
  @IsDateString()
  @IsOptional()
  asOfDate?: string | null;

  @ApiProperty({ 
    description: 'Whether to include projected future depreciation',
    required: false,
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  includeProjections?: boolean = false;

  @ApiProperty({ 
    description: 'Number of future periods to project (months)',
    required: false,
    default: 12 
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  projectionPeriods?: number = 12;
}

export class CalculateDepreciationResponseDto {
  @ApiProperty({ description: 'ID of the asset' })
  assetId: string | null;

  @ApiProperty({ description: 'Original cost of the asset' })
  originalCost: number | null;

  @ApiProperty({ description: 'Residual value at the end of useful life' })
  residualValue: number | null;

  @ApiProperty({ description: 'Total depreciable amount (original cost - residual value)' })
  depreciableAmount: number | null;

  @ApiProperty({ description: 'Current accumulated depreciation to date' })
  accumulatedDepreciation: number | null;

  @ApiProperty({ description: 'Current book value of the asset' })
  currentBookValue: number | null;

  @ApiProperty({ description: 'Whether the asset is fully depreciated' })
  isFullyDepreciated: boolean | null;

  @ApiProperty({ description: 'Depreciation method used in calculation' })
  depreciationMethod: DepreciationMethod;

  @ApiProperty({ description: 'List of historical depreciation entries' })
  entries: {
    date: string | null;
    amount: number | null;
    bookValue: number | null;
  }[];

  @ApiProperty({ description: 'List of projected future depreciation entries' })
  projectedEntries?: {
    date: string | null;
    amount: number | null;
    bookValue: number | null;
  }[];
} 