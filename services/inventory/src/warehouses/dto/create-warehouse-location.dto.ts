import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsPositive, 
  IsUUID,
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWarehouseLocationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the warehouse this location belongs to' })
  @IsUUID()
  warehouseId: string | null;

  @ApiProperty({ example: 'Aisle A', description: 'Name of the location' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string | null;

  @ApiProperty({ example: 'A-01-02', description: 'Code for the location, e?.g. Aisle-Rack-Shelf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string | null;

  @ApiPropertyOptional({ example: 'First aisle in the warehouse', description: 'Description of the location' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ example: 'Aisle', description: 'Type of location (Aisle, Rack, Shelf, Bin, etc.)' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  locationType?: string | null;

  @ApiPropertyOptional({ example: true, description: 'Whether the location is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;

  @ApiPropertyOptional({ example: 5, description: 'ID of the parent location (for hierarchical locations)' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  parentId?: number | null;
} 