import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Warehouse } from './warehouse.entity';

export class WarehouseLocation {
  @ApiProperty({ example: 1, description: 'Unique identifier for the warehouse location' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the warehouse this location belongs to' })
  warehouseId: number;

  @ApiProperty({ example: 'Aisle A', description: 'Name of the location' })
  name: string;

  @ApiProperty({ example: 'A-01-02', description: 'Code for the location, e.g. Aisle-Rack-Shelf' })
  code: string;

  @ApiPropertyOptional({ example: 'First aisle in the warehouse', description: 'Description of the location' })
  description?: string;

  @ApiPropertyOptional({ example: 'Aisle', description: 'Type of location (Aisle, Rack, Shelf, Bin, etc.)' })
  locationType?: string;

  @ApiProperty({ example: true, description: 'Whether the location is active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 5, description: 'ID of the parent location (for hierarchical locations)' })
  parentId?: number;

  @ApiPropertyOptional({ type: () => Warehouse, description: 'Warehouse this location belongs to' })
  warehouse?: Warehouse;

  @ApiPropertyOptional({ type: () => WarehouseLocation, description: 'Parent location (for hierarchical locations)' })
  parent?: WarehouseLocation;

  @ApiPropertyOptional({ type: [WarehouseLocation], description: 'Child locations (for hierarchical locations)' })
  children?: WarehouseLocation[];

  @ApiProperty({ example: '2023-01-15T12:00:00Z', description: 'When the location was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00Z', description: 'When the location was last updated' })
  updatedAt: Date;
} 