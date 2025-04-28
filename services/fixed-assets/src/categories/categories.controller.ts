import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from '../assets/dto/create-category.dto';
import { UpdateCategoryDto } from '../assets/dto/update-category.dto';
import { AssetCategoryEntity } from '../assets/entities/asset-category.entity';

@ApiTags('asset-categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({ status: 201, description: 'The asset category has been successfully created.', type: AssetCategoryEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<AssetCategoryEntity> {
    return this?.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset categories' })
  @ApiResponse({ status: 200, description: 'Return all asset categories', type: [AssetCategoryEntity] })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', type: Number })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take', type: Number })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Term to search for in category name or description', type: String })
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<{ categories: AssetCategoryEntity[]; total: number }> {
    return this?.categoriesService.findAllCategories(skip, take, searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific asset category by ID' })
  @ApiResponse({ status: 200, description: 'Return the asset category.', type: AssetCategoryEntity })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: String })
  findOne(@Param('id') id: string): Promise<AssetCategoryEntity> {
    return this?.categoriesService.findOneCategory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset category' })
  @ApiResponse({ status: 200, description: 'The asset category has been successfully updated.', type: AssetCategoryEntity })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: String })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<AssetCategoryEntity> {
    return this?.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset category' })
  @ApiResponse({ status: 200, description: 'The asset category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: String })
  remove(@Param('id') id: string): Promise<void> {
    return this?.categoriesService.removeCategory(id);
  }
} 