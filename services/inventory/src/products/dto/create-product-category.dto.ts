import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUrl, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @ApiProperty({ example: 'Office Furniture', description: 'Name of the category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string | null;

  @ApiPropertyOptional({ 
    example: 'All office furniture products', 
    description: 'Description of the category' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ 
    example: 5, 
    description: 'ID of the parent category, if this is a subcategory' 
  })
  @IsNumber()
  @IsOptional()
  parentId?: number | null;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the category is active', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;

  @ApiPropertyOptional({ 
    example: 'https://example.com/images/office-furniture.jpg', 
    description: 'URL to the category image' 
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;
} 