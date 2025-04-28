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
import { DepreciationMethod } from '../enums/depreciation-method.enum.js';

export class CalculateDepreciationDto {
  @ApiProperty({ description: 'ID of the asset to calculate depreciation for' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

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
  asOfDate?: string;

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
  assetId: string;

  @ApiProperty({ description: 'Original cost of the asset' })
  originalCost: number;

  @ApiProperty({ description: 'Residual value at the end of useful life' })
  residualValue: number;

  @ApiProperty({ description: 'Total depreciable amount (original cost - residual value)' })
  depreciableAmount: number;

  @ApiProperty({ description: 'Current accumulated depreciation to date' })
  accumulatedDepreciation: number;

  @ApiProperty({ description: 'Current book value of the asset' })
  currentBookValue: number;

  @ApiProperty({ description: 'Whether the asset is fully depreciated' })
  isFullyDepreciated: boolean;

  @ApiProperty({ description: 'Depreciation method used in calculation' })
  depreciationMethod: DepreciationMethod;

  @ApiProperty({ description: 'List of historical depreciation entries' })
  entries: {
    date: string;
    amount: number;
    bookValue: number;
  }[];

  @ApiProperty({ description: 'List of projected future depreciation entries' })
  projectedEntries?: {
    date: string;
    amount: number;
    bookValue: number;
  }[];
} 