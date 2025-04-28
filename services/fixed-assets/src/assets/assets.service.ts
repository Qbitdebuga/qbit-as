import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';
import { AssetEntity } from './entities/asset.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { AssetCategoryEntity } from './entities/asset-category.entity.js';
import { Prisma } from '@prisma/client';
import { AssetStatus } from './enums/asset-status.enum.js';
import { DepreciationMethod } from '../depreciation/enums/depreciation-method.enum.js';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Helper property to access Prisma models with type casting
  private get db() {
    return this.prisma as any;
  }

  // Asset methods
  async create(createAssetDto: CreateAssetDto): Promise<AssetEntity> {
    try {
      // Check if category exists
      const category = await this.db.assetCategory.findUnique({
        where: { id: createAssetDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${createAssetDto.categoryId} not found`);
      }

      // Check if asset number already exists
      const existingAsset = await this.db.asset.findUnique({
        where: { assetNumber: createAssetDto.assetNumber },
      });

      if (existingAsset) {
        throw new ConflictException(`Asset with asset number ${createAssetDto.assetNumber} already exists`);
      }

      // Get the status value or default to ACTIVE
      const statusValue = createAssetDto.status || AssetStatus.ACTIVE;
      
      // Get the depreciation method value or default to STRAIGHT_LINE
      const depreciationMethodValue = createAssetDto.depreciationMethod || DepreciationMethod.STRAIGHT_LINE;
      
      const asset = await this.db.asset.create({
        data: {
          name: createAssetDto.name,
          description: createAssetDto.description,
          assetNumber: createAssetDto.assetNumber,
          purchaseDate: new Date(createAssetDto.purchaseDate),
          purchaseCost: new Prisma.Decimal(createAssetDto.purchaseCost.toString()),
          residualValue: new Prisma.Decimal(createAssetDto.residualValue.toString()),
          assetLifeYears: createAssetDto.assetLifeYears,
          // Use type assertion to tell TypeScript this is the correct enum value
          status: statusValue as any,
          serialNumber: createAssetDto.serialNumber,
          location: createAssetDto.location,
          notes: createAssetDto.notes,
          categoryId: createAssetDto.categoryId,
          // Use type assertion to tell TypeScript this is the correct enum value
          depreciationMethod: depreciationMethodValue as any,
        },
        include: {
          category: true,
        },
      });

      // Map back to our entity
      return new AssetEntity({
        ...asset,
        status: statusValue,
        depreciationMethod: depreciationMethodValue,
      });
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
      const where: any = {};
      
      if (status) {
        // Map our enum status to Prisma's enum string
        const statusMap = {
          [AssetStatus.ACTIVE]: 'ACTIVE',
          [AssetStatus.INACTIVE]: 'INACTIVE',
          [AssetStatus.DISPOSED]: 'DISPOSED',
          [AssetStatus.FULLY_DEPRECIATED]: 'FULLY_DEPRECIATED',
          [AssetStatus.UNDER_MAINTENANCE]: 'UNDER_MAINTENANCE',
        };
        where.status = statusMap[status];
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
        this.db.asset.findMany({
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
        this.db.asset.count({ where }),
      ]);

      // Calculate current book value for each asset
      const assetsWithCalculatedValues = await Promise.all(
        assets.map(async (asset) => {
          const depreciation = await this.calculateDepreciation(asset.id);
          return {
            ...asset,
            status: AssetStatus[asset.status],
            depreciationMethod: DepreciationMethod[asset.depreciationMethod],
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
      const asset = await this.db.asset.findUnique({
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

      // Map Prisma status back to our enum for the entity
      const mappedAsset = {
        ...asset,
        status: AssetStatus[asset.status],
        depreciationMethod: DepreciationMethod[asset.depreciationMethod],
        currentBookValue: depreciation.currentBookValue,
        accumulatedDepreciation: depreciation.accumulatedDepreciation,
      };

      return new AssetEntity(mappedAsset);
    } catch (error) {
      this.logger.error(`Error finding asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<AssetEntity> {
    try {
      // Check if asset exists
      const existingAsset = await this.db.asset.findUnique({
        where: { id },
      });

      if (!existingAsset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      // Check if category exists if categoryId is provided
      if (updateAssetDto.categoryId) {
        const category = await this.db.assetCategory.findUnique({
          where: { id: updateAssetDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(`Asset category with ID ${updateAssetDto.categoryId} not found`);
        }
      }

      // Check if asset number is unique if updating
      if (updateAssetDto.assetNumber && updateAssetDto.assetNumber !== existingAsset.assetNumber) {
        const assetWithSameNumber = await this.db.asset.findUnique({
          where: { assetNumber: updateAssetDto.assetNumber },
        });

        if (assetWithSameNumber) {
          throw new ConflictException(`Asset with asset number ${updateAssetDto.assetNumber} already exists`);
        }
      }

      const data: any = { ...updateAssetDto };

      // Map status enum if provided
      if (updateAssetDto.status) {
        const statusMap = {
          [AssetStatus.ACTIVE]: 'ACTIVE',
          [AssetStatus.INACTIVE]: 'INACTIVE',
          [AssetStatus.DISPOSED]: 'DISPOSED',
          [AssetStatus.FULLY_DEPRECIATED]: 'FULLY_DEPRECIATED',
          [AssetStatus.UNDER_MAINTENANCE]: 'UNDER_MAINTENANCE',
        };
        data.status = statusMap[updateAssetDto.status];
      }

      // Map depreciation method enum if provided
      if (updateAssetDto.depreciationMethod) {
        const depreciationMethodMap = {
          [DepreciationMethod.STRAIGHT_LINE]: 'STRAIGHT_LINE',
          [DepreciationMethod.DECLINING_BALANCE]: 'DECLINING_BALANCE',
          [DepreciationMethod.UNITS_OF_PRODUCTION]: 'UNITS_OF_PRODUCTION',
        };
        data.depreciationMethod = depreciationMethodMap[updateAssetDto.depreciationMethod];
      }

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

      const asset = await this.db.asset.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      });

      // Map Prisma status back to our enum for the entity
      const mappedAsset = {
        ...asset,
        status: AssetStatus[asset.status],
        depreciationMethod: DepreciationMethod[asset.depreciationMethod],
      };

      return new AssetEntity(mappedAsset);
    } catch (error) {
      this.logger.error(`Error updating asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if asset exists
      const asset = await this.db.asset.findUnique({
        where: { id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      // Delete asset and its depreciation entries in a transaction
      await this.db.$transaction([
        this.db.depreciationEntry.deleteMany({
          where: { assetId: id },
        }),
        this.db.asset.delete({
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
    const asset = await this.db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Get the latest depreciation entry for the asset
    const latestEntry = await this.db.depreciationEntry.findFirst({
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
      const category = await this.db.assetCategory.create({
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
      const where: any = {};
      
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [categories, total] = await Promise.all([
        this.db.assetCategory.findMany({
          where,
          skip,
          take,
          orderBy: {
            name: 'asc',
          },
        }),
        this.db.assetCategory.count({ where }),
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
      const category = await this.db.assetCategory.findUnique({
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
      const category = await this.db.assetCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Asset category with ID ${id} not found`);
      }

      const updatedCategory = await this.db.assetCategory.update({
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
      const category = await this.db.assetCategory.findUnique({
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

      await this.db.assetCategory.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error removing asset category: ${error.message}`, error.stack);
      throw error;
    }
  }
} 