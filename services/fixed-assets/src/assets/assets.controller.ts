import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AssetEntity } from './entities/asset.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AssetCategoryEntity } from './entities/asset-category.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetStatus } from './enums/asset-status.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Asset endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({
    status: 201,
    description: 'The asset has been successfully created.',
    type: AssetEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  @ApiResponse({ status: 409, description: 'Asset number already exists.' })
  async create(@Body() createAssetDto: CreateAssetDto): Promise<AssetEntity> {
    return this?.assetsService.create(createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets with pagination' })
  @ApiResponse({ status: 200, description: 'Return the list of assets.', type: [AssetEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AssetStatus,
    description: 'Filter by asset status',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: AssetStatus,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ): Promise<{ assets: AssetEntity[]; total: number }> {
    return this?.assetsService.findAll(
      skip ? +skip : 0,
      take ? +take : 10,
      status,
      categoryId,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by ID' })
  @ApiResponse({ status: 200, description: 'Return the asset.', type: AssetEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  async findOne(@Param('id') id: string): Promise<AssetEntity> {
    return this?.assetsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({
    status: 200,
    description: 'The asset has been successfully updated.',
    type: AssetEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Asset or asset category not found.' })
  @ApiResponse({ status: 409, description: 'Asset number already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<AssetEntity> {
    return this?.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 204, description: 'The asset has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this?.assetsService.remove(id);
  }

  // Asset Category endpoints
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({
    status: 201,
    description: 'The asset category has been successfully created.',
    type: AssetCategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<AssetCategoryEntity> {
    return this?.assetsService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all asset categories with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return the list of asset categories.',
    type: [AssetCategoryEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  async findAllCategories(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ): Promise<{ categories: AssetCategoryEntity[]; total: number }> {
    return this?.assetsService.findAllCategories(skip ? +skip : 0, take ? +take : 10, search);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get an asset category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the asset category.',
    type: AssetCategoryEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  async findOneCategory(@Param('id') id: string): Promise<AssetCategoryEntity> {
    return this?.assetsService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Update an asset category' })
  @ApiResponse({
    status: 200,
    description: 'The asset category has been successfully updated.',
    type: AssetCategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<AssetCategoryEntity> {
    return this?.assetsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance', 'asset-manager')
  @ApiOperation({ summary: 'Delete an asset category' })
  @ApiResponse({ status: 204, description: 'The asset category has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Asset category not found.' })
  @ApiResponse({ status: 409, description: 'Cannot delete category with assets.' })
  async removeCategory(@Param('id') id: string): Promise<void> {
    return this?.assetsService.removeCategory(id);
  }
}
