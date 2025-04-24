import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';

@Injectable()
export class WarehousesRepository {
  constructor(private prisma: PrismaService) {}

  // Warehouse methods
  async createWarehouse(data: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        isActive: data.isActive ?? true,
        isPrimary: data.isPrimary ?? false,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
    });
  }

  async findAllWarehouses(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.WarehouseWhereUniqueInput;
    where?: Prisma.WarehouseWhereInput;
    orderBy?: Prisma.WarehouseOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
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
      this.prisma.warehouse.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneWarehouse(id: number) {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async findWarehouseByCode(code: string) {
    return this.prisma.warehouse.findUnique({
      where: { code },
      include: {
        locations: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async updateWarehouse(id: number, data: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async removeWarehouse(id: number) {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  // If this is set as the primary warehouse, unset any existing primary warehouses
  async setPrimaryWarehouse(id: number) {
    // First, find the current primary warehouse if any
    const currentPrimary = await this.prisma.warehouse.findFirst({
      where: { isPrimary: true },
    });
    
    // Update in a transaction to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      // If there's a current primary and it's different from the one we're setting
      if (currentPrimary && currentPrimary.id !== id) {
        await tx.warehouse.update({
          where: { id: currentPrimary.id },
          data: { isPrimary: false },
        });
      }
      
      // Set the new primary warehouse
      return tx.warehouse.update({
        where: { id },
        data: { isPrimary: true },
      });
    });
  }

  // Warehouse Location methods
  async createLocation(data: CreateWarehouseLocationDto) {
    return this.prisma.warehouseLocation.create({
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
    skip?: number;
    take?: number;
    cursor?: Prisma.WarehouseLocationWhereUniqueInput;
    where?: Prisma.WarehouseLocationWhereInput;
    orderBy?: Prisma.WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.warehouseLocation.findMany({
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
      this.prisma.warehouseLocation.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneLocation(id: number) {
    return this.prisma.warehouseLocation.findUnique({
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

  async findLocationByWarehouseAndCode(warehouseId: number, code: string) {
    return this.prisma.warehouseLocation.findUnique({
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
    return this.prisma.warehouseLocation.update({
      where: { id },
      data,
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  async removeLocation(id: number) {
    return this.prisma.warehouseLocation.delete({
      where: { id },
    });
  }

  // Get all locations for a specific warehouse
  async findWarehouseLocations(warehouseId: number, params: {
    skip?: number;
    take?: number;
    where?: Omit<Prisma.WarehouseLocationWhereInput, 'warehouseId'>;
    orderBy?: Prisma.WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.warehouseLocation.findMany({
        skip,
        take,
        where: {
          warehouseId,
          ...where,
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
      this.prisma.warehouseLocation.count({
        where: {
          warehouseId,
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

  // Get child locations of a parent location
  async findChildLocations(parentId: number, params: {
    skip?: number;
    take?: number;
    where?: Omit<Prisma.WarehouseLocationWhereInput, 'parentId'>;
    orderBy?: Prisma.WarehouseLocationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.warehouseLocation.findMany({
        skip,
        take,
        where: {
          parentId,
          ...where,
        },
        orderBy,
      }),
      this.prisma.warehouseLocation.count({
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