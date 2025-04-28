import { Injectable } from '@nestjs/common';
import { AssetsService } from '../assets/assets.service.js';
import { CreateCategoryDto } from '../assets/dto/create-category.dto.js';
import { UpdateCategoryDto } from '../assets/dto/update-category.dto.js';
import { AssetCategoryEntity } from '../assets/entities/asset-category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly assetsService: AssetsService) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<AssetCategoryEntity> {
    return this.assetsService.createCategory(createCategoryDto);
  }

  async findAllCategories(
    skip?: number,
    take?: number,
    searchTerm?: string,
  ): Promise<{ categories: AssetCategoryEntity[]; total: number }> {
    return this.assetsService.findAllCategories(skip, take, searchTerm);
  }

  async findOneCategory(id: string): Promise<AssetCategoryEntity> {
    return this.assetsService.findOneCategory(id);
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<AssetCategoryEntity> {
    return this.assetsService.updateCategory(id, updateCategoryDto);
  }

  async removeCategory(id: string): Promise<void> {
    return this.assetsService.removeCategory(id);
  }
} 