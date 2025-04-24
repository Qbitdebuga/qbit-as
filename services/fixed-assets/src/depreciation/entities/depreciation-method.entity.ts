import { ApiProperty } from '@nestjs/swagger';
import { DepreciationMethod } from '@prisma/client';

export class DepreciationMethodEntity {
  @ApiProperty({
    description: 'Depreciation method identifier',
    enum: DepreciationMethod,
    example: DepreciationMethod.STRAIGHT_LINE,
  })
  method: DepreciationMethod;

  @ApiProperty({
    description: 'Human-readable name of the depreciation method',
    example: 'Straight Line',
  })
  name: string;

  @ApiProperty({
    description: 'Description of how the depreciation method works',
    example: 'Depreciates the asset by an equal amount each year over its useful life',
  })
  description: string;

  constructor(method: DepreciationMethod) {
    this.method = method;
    
    // Set name and description based on method
    switch (method) {
      case DepreciationMethod.STRAIGHT_LINE:
        this.name = 'Straight Line';
        this.description = 'Depreciates the asset by an equal amount each year over its useful life';
        break;
      case DepreciationMethod.DECLINING_BALANCE:
        this.name = 'Declining Balance';
        this.description = 'Applies a constant rate to the declining book value of the asset';
        break;
      case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
        this.name = 'Double Declining Balance';
        this.description = 'Accelerated method that applies twice the straight-line rate to the declining book value';
        break;
      case DepreciationMethod.UNITS_OF_PRODUCTION:
        this.name = 'Units of Production';
        this.description = 'Bases depreciation on actual usage or production of the asset';
        break;
      case DepreciationMethod.SUM_OF_YEARS_DIGITS:
        this.name = 'Sum of Years Digits';
        this.description = 'Accelerated method that allocates more depreciation in earlier years';
        break;
      default:
        this.name = 'Unknown';
        this.description = 'Depreciation method not recognized';
    }
  }
} 