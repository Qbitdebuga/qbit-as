import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the asset category' })
  @IsString()
  @IsNotEmpty()
  name: string | null;

  @ApiProperty({ description: 'Description of the asset category', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;
} 