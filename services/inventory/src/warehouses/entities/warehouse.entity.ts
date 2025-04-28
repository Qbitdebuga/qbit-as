import { ApiProperty } from '@nestjs/swagger';

export class WarehouseEntity {
  @ApiProperty({ description: 'Unique identifier for the warehouse' })
  id: string | null;

  @ApiProperty({ description: 'Unique warehouse code' })
  code: string | null;

  @ApiProperty({ description: 'Warehouse name' })
  name: string | null;

  @ApiProperty({ description: 'Warehouse description', required: false })
  description: string | null;

  @ApiProperty({ description: 'Warehouse address', required: false })
  address: string | null;

  @ApiProperty({ description: 'Warehouse city', required: false })
  city: string | null;

  @ApiProperty({ description: 'Warehouse state/province', required: false })
  state: string | null;

  @ApiProperty({ description: 'Warehouse postal code', required: false })
  postalCode: string | null;

  @ApiProperty({ description: 'Warehouse country', required: false })
  country: string | null;

  @ApiProperty({ description: 'Whether this is the primary warehouse' })
  isPrimary: boolean | null;

  @ApiProperty({ description: 'Whether this warehouse is active' })
  isActive: boolean | null;

  @ApiProperty({ description: 'Date and time when the warehouse was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the warehouse was last updated' })
  updatedAt: Date;
} 