import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Name of the asset category', required: false })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({ description: 'Description of the asset category', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;
} 