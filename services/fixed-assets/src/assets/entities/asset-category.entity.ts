import { ApiProperty } from '@nestjs/swagger';

export class AssetCategoryEntity {
  @ApiProperty({ description: 'Unique identifier of the asset category' })
  id: string;

  @ApiProperty({ description: 'Name of the asset category' })
  name: string;

  @ApiProperty({ description: 'Description of the asset category', required: false })
  description: string | null;

  @ApiProperty({ description: 'Date when the asset category was created in the system' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the asset category was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<AssetCategoryEntity>) {
    Object.assign(this, partial);
  }
} 