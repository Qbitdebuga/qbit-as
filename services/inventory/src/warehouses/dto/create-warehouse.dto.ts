import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Unique warehouse code', example: 'WH-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Warehouse name', example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Warehouse description', example: 'Main storage facility', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Warehouse address', example: '123 Storage St', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ description: 'Warehouse city', example: 'New York', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Warehouse state/province', example: 'NY', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Warehouse postal code', example: '10001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ description: 'Warehouse country', example: 'USA', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Whether this is the primary warehouse', example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Whether this warehouse is active', example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 