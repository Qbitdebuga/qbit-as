import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarehousePublisher } from '../events/publishers/warehouse-publisher';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { 
  WarehouseWhereInput,
  WarehouseOrderByWithRelationInput,
  SortOrder,
  QueryMode
} from '../prisma/prisma.types';

interface FindAllOptions {
  skip?: number | null;
  take?: number | null;
  searchTerm?: string | null;
  orderBy?: string | null;
  includeInactive?: boolean | null;
}

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehousePublisher: WarehousePublisher
  ) {}
  
  // Helper to safely access Prisma models
  private get db() {
    return this.prisma as any;
  }

  async create(createWarehouseDto: CreateWarehouseDto) {
    try {
      const warehouse = await this?.db.warehouse.create({
        data: createWarehouseDto,
      });
      
      // Publish warehouse created event
      await this?.warehousePublisher.publishWarehouseCreated(warehouse.id, warehouse);
      
      return warehouse;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Warehouse with code ${createWarehouseDto.code} already exists`);
      }
      throw error;
    }
  }

  async findAll(options: FindAllOptions = {}) {
    const { skip = 0, take = 10, searchTerm, orderBy, includeInactive = false } = options;
    
    const where: WarehouseWhereInput = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: QueryMode.insensitive } },
        { code: { contains: searchTerm, mode: QueryMode.insensitive } },
        { description: { contains: searchTerm, mode: QueryMode.insensitive } },
      ];
    }
    
    let orderByClause: WarehouseOrderByWithRelationInput = { createdAt: SortOrder.desc };
    
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      orderByClause = {
        [field]: direction === 'desc' ? SortOrder.desc : SortOrder.asc,
      };
    }

    const [warehouses, total] = await Promise.all([
      this?.db.warehouse.findMany({
        where,
        skip,
        take,
        orderBy: orderByClause,
      }),
      this?.db.warehouse.count({ where }),
    ]);

    return {
      data: warehouses,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const warehouse = await this?.db.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    try {
      // Check if warehouse exists
      await this.findOne(id);
      
      const updatedWarehouse = await this?.db.warehouse.update({
        where: { id },
        data: updateWarehouseDto,
      });
      
      // Publish warehouse updated event
      await this?.warehousePublisher.publishWarehouseUpdated(updatedWarehouse.id, updatedWarehouse);
      
      return updatedWarehouse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(`Warehouse with code ${updateWarehouseDto.code} already exists`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Check if warehouse exists
    await this.findOne(id);
    
    const removedWarehouse = await this?.db.warehouse.delete({
      where: { id },
    });
    
    // Publish warehouse deleted event
    await this?.warehousePublisher.publishWarehouseDeleted(id);
    
    return removedWarehouse;
  }
}