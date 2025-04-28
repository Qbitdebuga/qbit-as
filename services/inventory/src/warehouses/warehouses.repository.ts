import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import {
  WarehouseWhereUniqueInput,
  WarehouseWhereInput,
  WarehouseOrderByWithRelationInput,
  WarehouseLocationWhereUniqueInput,
  WarehouseLocationWhereInput,
  WarehouseLocationOrderByWithRelationInput
} from '../prisma/prisma.types';

@Injectable()
export class WarehousesRepository {
  constructor(private prisma: PrismaService) {}
  
  // Helper to safely access Prisma models
  private get db() {
    return this.prisma as any;
  }

  // Warehouse methods
  async createWarehouse(data: CreateWarehouseDto) {
    return this?.db.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isActive: data.isActive ?? true,
        isPrimary: data.isPrimary ?? false,
      },
    });
  }

  async findAllWarehouses(params: {
    skip?: number | null;
    take?: number | null;
    cursor?: WarehouseWhereUniqueInput;
    where?: WarehouseWhereInput;
    orderBy?: WarehouseOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this?.db.warehouse.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          locations: {
            where: {
              parentId: null, // Only include top-level locations
            },
            select: {
              id: true,
              name: true,
              code: true,
              locationType: true,
            },
          },
          _count: {
            select: {
              locations: true,
            },
          },
        },
      }),
      this?.db.warehouse.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneWarehouse(id: string) {
    return this?.db.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async findWarehouseByCode(code: string) {
    return this?.db.warehouse.findUnique({
      where: { code },
      include: {
        locations: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async updateWarehouse(id: string, data: UpdateWarehouseDto) {
    return this?.db.warehouse.update({
      where: { id },
      data,
    });
  }

  async removeWarehouse(id: string) {
    return this?.db.warehouse.delete({
      where: { id },
    });
  }

  // If this is set as the primary warehouse, unset any existing primary warehouses
  async setPrimaryWarehouse(id: string) {
    // First, find the current primary warehouse if any
    const currentPrimary = await this?.db.warehouse.findFirst({
      where: { isPrimary: true },
    });
    
    // Update in a transaction to ensure consistency
    return this?.prisma.$transaction(async (tx: any) => {
      // If there's a current primary and it's different from the one we're setting
      if (currentPrimary && currentPrimary.id !== id) {
        await tx?.warehouse.update({
          where: { id: currentPrimary.id },
          data: { isPrimary: false },
        });
      }
      
      // Set the new primary warehouse
      return tx?.warehouse.update({
        where: { id },
        data: { isPrimary: true },
      });
    });
  }

  // Warehouse Location methods
  async createLocation(data: CreateWarehouseLocationDto) {
    return this?.db.warehouseLocation.create({
      data: {
        warehouseId: data.warehouseId,
        name: data.name,
        code: data.code,
        description: data.description,
        locationType: data.locationType,
        isActive: data.isActive ?? true,
        parentId: data.parentId,
      },
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  async findAllLocations(params: {
    skip?: number | null;
    take?: number | null;
    cursor?: WarehouseLocationWhereUniqueInput;
    where?: WarehouseLocationWhereInput;
    orderBy?: WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this?.db.warehouseLocation.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              children: true,
              inventoryLevels: true,
            },
          },
        },
      }),
      this?.db.warehouseLocation.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneLocation(id: number) {
    return this?.db.warehouseLocation.findUnique({
      where: { id },
      include: {
        warehouse: true,
        parent: true,
        children: {
          orderBy: { name: 'asc' },
        },
        inventoryLevels: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async findLocationByWarehouseAndCode(warehouseId: string, code: string) {
    return this?.db.warehouseLocation.findUnique({
      where: {
        warehouseId_code: {
          warehouseId,
          code,
        },
      },
      include: {
        warehouse: true,
        parent: true,
        children: true,
      },
    });
  }

  async updateLocation(id: number, data: UpdateWarehouseLocationDto) {
    return this?.db.warehouseLocation.update({
      where: { id },
      data,
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  async removeLocation(id: number) {
    return this?.db.warehouseLocation.delete({
      where: { id },
    });
  }

  // Get all locations for a specific warehouse
  async findWarehouseLocations(warehouseId: string, params: {
    skip?: number | null;
    take?: number | null;
    where?: Omit<WarehouseLocationWhereInput, 'warehouseId'>;
    orderBy?: WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this?.db.warehouseLocation.findMany({
        skip,
        take,
        where: {
          ...where,
          warehouseId,
        },
        orderBy,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              children: true,
              inventoryLevels: true,
            },
          },
        },
      }),
      this?.db.warehouseLocation.count({
        where: {
          ...where,
          warehouseId,
        },
      }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  // Get child locations of a parent location
  async findChildLocations(parentId: number, params: {
    skip?: number | null;
    take?: number | null;
    where?: Omit<WarehouseLocationWhereInput, 'parentId'>;
    orderBy?: WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this?.db.warehouseLocation.findMany({
        skip,
        take,
        where: {
          parentId,
          ...where,
        },
        orderBy,
      }),
      this?.db.warehouseLocation.count({
        where: {
          parentId,
          ...where,
        },
      }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }
} 