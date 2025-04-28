import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepreciationEntryDto {
  @ApiProperty({
    description: 'UUID of the asset to record depreciation for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  assetId: string;

  @ApiProperty({
    description: 'Date of the depreciation entry',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({
    description: 'Amount of depreciation to record',
    example: 1000.00,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: 'Optional note for the depreciation entry',
    example: 'Monthly depreciation for January 2023',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class DepreciationEntryResponseDto {
  @ApiProperty({
    description: 'UUID of the created depreciation entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the asset',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assetId: string;

  @ApiProperty({
    description: 'Date of the depreciation entry',
    example: '2023-01-01T00:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Amount of depreciation recorded',
    example: 1000.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Book value after depreciation',
    example: 9000.00,
  })
  bookValue: number;

  @ApiProperty({
    description: 'Optional note for the depreciation entry',
    example: 'Monthly depreciation for January 2023',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'Date when the entry was created',
    example: '2023-01-01T12:00:00.000Z',
  })
  createdAt: Date;
} 