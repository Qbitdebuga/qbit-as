import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetEntity } from './entities/asset.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AssetCategoryEntity } from './entities/asset-category.entity';
import { AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Asset methods
  async create(createAssetDto: CreateAssetDto): Promise<AssetEntity> {
    try {
      // Check if category exists
      const category = await this.prisma.assetCategory.findUnique({
        where: { id: createAssetDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${createAssetDto.categoryId} not found`);
      }

      // Check if asset number already exists
      const existingAsset = await this.prisma.asset.findUnique({
        where: { assetNumber: createAssetDto.assetNumber },
      });

      if (existingAsset) {
        throw new ConflictException(`Asset with asset number ${createAssetDto.assetNumber} already exists`);
      }

      const asset = await this.prisma.asset.create({
        data: {
          ...createAssetDto,
          purchaseDate: new Date(createAssetDto.purchaseDate),
          purchaseCost: new Prisma.Decimal(createAssetDto.purchaseCost.toString()),
          residualValue: new Prisma.Decimal(createAssetDto.residualValue.toString()),
        },
        include: {
          category: true,
        },
      });

      return new AssetEntity(asset);
    } catch (error) {
      this.logger.error(`Error creating asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    skip = 0,
    take = 10,
    status?: AssetStatus,
    categoryId?: string,
    searchTerm?: string,
  ): Promise<{ assets: AssetEntity[]; total: number }> {
    try {
      const where: Prisma.AssetWhereInput = {};
      
      if (status) {
        where.status = status;
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { assetNumber: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
          { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [assets, total] = await Promise.all([
        this.prisma.asset.findMany({
          where,
          skip,
          take,
          include: {
            category: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        this.prisma.asset.count({ where }),
      ]);

      // Calculate current book value for each asset
      const assetsWithCalculatedValues = await Promise.all(
        assets.map(async (asset) => {
          const depreciation = await this.calculateDepreciation(asset.id);
          return {
            ...asset,
            currentBookValue: depreciation.currentBookValue,
            accumulatedDepreciation: depreciation.accumulatedDepreciation,
          };
        })
      );

      return {
        assets: assetsWithCalculatedValues.map(asset => new AssetEntity(asset)),
        total,
      };
    } catch (error) {
      this.logger.error(`Error finding assets: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<AssetEntity> {
    try {
      const asset = await this.prisma.asset.findUnique({
        where: { id },
        include: {
          category: true,
          depreciationEntries: {
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      const depreciation = await this.calculateDepreciation(id);

      return new AssetEntity({
        ...asset,
        currentBookValue: depreciation.currentBookValue,
        accumulatedDepreciation: depreciation.accumulatedDepreciation,
      });
    } catch (error) {
      this.logger.error(`Error finding asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<AssetEntity> {
    try {
      // Check if asset exists
      const existingAsset = await this.prisma.asset.findUnique({
        where: { id },
      });

      if (!existingAsset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      // Check if category exists if categoryId is provided
      if (updateAssetDto.categoryId) {
        const category = await this.prisma.assetCategory.findUnique({
          where: { id: updateAssetDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(`Asset category with ID ${updateAssetDto.categoryId} not found`);
        }
      }

      // Check if asset number is unique if updating
      if (updateAssetDto.assetNumber && updateAssetDto.assetNumber !== existingAsset.assetNumber) {
        const assetWithSameNumber = await this.prisma.asset.findUnique({
          where: { assetNumber: updateAssetDto.assetNumber },
        });

        if (assetWithSameNumber) {
          throw new ConflictException(`Asset with asset number ${updateAssetDto.assetNumber} already exists`);
        }
      }

      const data: Prisma.AssetUpdateInput = { ...updateAssetDto };

      // Convert string dates to Date objects if provided
      if (updateAssetDto.purchaseDate) {
        data.purchaseDate = new Date(updateAssetDto.purchaseDate);
      }

      // Convert number values to Prisma.Decimal if provided
      if (updateAssetDto.purchaseCost !== undefined) {
        data.purchaseCost = new Prisma.Decimal(updateAssetDto.purchaseCost.toString());
      }

      if (updateAssetDto.residualValue !== undefined) {
        data.residualValue = new Prisma.Decimal(updateAssetDto.residualValue.toString());
      }

      const asset = await this.prisma.asset.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      });

      return new AssetEntity(asset);
    } catch (error) {
      this.logger.error(`Error updating asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if asset exists
      const asset = await this.prisma.asset.findUnique({
        where: { id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      // Delete asset and its depreciation entries in a transaction
      await this.prisma.$transaction([
        this.prisma.depreciationEntry.deleteMany({
          where: { assetId: id },
        }),
        this.prisma.asset.delete({
          where: { id },
        }),
      ]);
    } catch (error) {
      this.logger.error(`Error removing asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Calculate current depreciation for an asset
  private async calculateDepreciation(assetId: string): Promise<{ currentBookValue: Prisma.Decimal; accumulatedDepreciation: Prisma.Decimal }> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Get the latest depreciation entry for the asset
    const latestEntry = await this.prisma.depreciationEntry.findFirst({
      where: { assetId },
      orderBy: { date: 'desc' },
    });

    if (latestEntry) {
      return {
        currentBookValue: latestEntry.bookValue,
        accumulatedDepreciation: asset.purchaseCost.sub(latestEntry.bookValue),
      };
    }

    // If no depreciation entries exist, calculate based on purchase date
    const purchaseDate = asset.purchaseDate;
    const currentDate = new Date();
    const monthsSincePurchase = (
      (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
      (currentDate.getMonth() - purchaseDate.getMonth())
    );

    // Simple straight-line depreciation calculation
    const lifetimeInMonths = asset.assetLifeYears * 12;
    const depreciableAmount = asset.purchaseCost.sub(asset.residualValue);
    const monthlyDepreciation = depreciableAmount.div(lifetimeInMonths);
    
    // Calculate accumulated depreciation (capped at depreciable amount)
    const calculatedDepreciation = monthlyDepreciation.mul(Math.min(monthsSincePurchase, lifetimeInMonths));
    const accumulatedDepreciation = calculatedDepreciation.gt(depreciableAmount) 
      ? depreciableAmount 
      : calculatedDepreciation;
    
    const currentBookValue = asset.purchaseCost.sub(accumulatedDepreciation);
    
    return {
      currentBookValue,
      accumulatedDepreciation,
    };
  }

  // Asset Category methods
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<AssetCategoryEntity> {
    try {
      const category = await this.prisma.assetCategory.create({
        data: createCategoryDto,
      });

      return new AssetCategoryEntity(category);
    } catch (error) {
      this.logger.error(`Error creating asset category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllCategories(skip = 0, take = 10, searchTerm?: string): Promise<{ categories: AssetCategoryEntity[]; total: number }> {
    try {
      const where: Prisma.AssetCategoryWhereInput = {};
      
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [categories, total] = await Promise.all([
        this.prisma.assetCategory.findMany({
          where,
          skip,
          take,
          orderBy: {
            name: 'asc',
          },
        }),
        this.prisma.assetCategory.count({ where }),
      ]);

      return {
        categories: categories.map(category => new AssetCategoryEntity(category)),
        total,
      };
    } catch (error) {
      this.logger.error(`Error finding asset categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOneCategory(id: string): Promise<AssetCategoryEntity> {
    try {
      const category = await this.prisma.assetCategory.findUnique({
        where: { id },
        include: {
          assets: {
            take: 5,
            orderBy: {
              updatedAt: 'desc',
            },
          },
          _count: {
            select: { assets: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${id} not found`);
      }

      return new AssetCategoryEntity(category);
    } catch (error) {
      this.logger.error(`Error finding asset category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<AssetCategoryEntity> {
    try {
      // Check if category exists
      const category = await this.prisma.assetCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${id} not found`);
      }

      const updatedCategory = await this.prisma.assetCategory.update({
        where: { id },
        data: updateCategoryDto,
      });

      return new AssetCategoryEntity(updatedCategory);
    } catch (error) {
      this.logger.error(`Error updating asset category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeCategory(id: string): Promise<void> {
    try {
      // Check if category exists
      const category = await this.prisma.assetCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: { assets: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${id} not found`);
      }

      // Check if category has assets
      if (category._count.assets > 0) {
        throw new ConflictException(`Cannot delete category with ${category._count.assets} assets. Please reassign or delete the assets first.`);
      }

      await this.prisma.assetCategory.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error removing asset category: ${error.message}`, error.stack);
      throw error;
    }
  }
} 