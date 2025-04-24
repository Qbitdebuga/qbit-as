import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Prisma } from '@prisma/client';

interface FindAllOptions {
  skip?: number;
  take?: number;
  searchTerm?: string;
  orderBy?: string;
  includeInactive?: boolean;
}

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    try {
      return await this.prisma.warehouse.create({
        data: createWarehouseDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Warehouse with code ${createWarehouseDto.code} already exists`);
      }
      throw error;
    }
  }

  async findAll(options: FindAllOptions = {}) {
    const { skip = 0, take = 10, searchTerm, orderBy, includeInactive = false } = options;
    
    const where: Prisma.WarehouseWhereInput = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    let orderByClause: Prisma.WarehouseOrderByWithRelationInput = { createdAt: 'desc' };
    
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      orderByClause = {
        [field]: direction === 'desc' ? 'desc' : 'asc',
      };
    }

    const [warehouses, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take,
        orderBy: orderByClause,
      }),
      this.prisma.warehouse.count({ where }),
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
    const warehouse = await this.prisma.warehouse.findUnique({
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
      
      return await this.prisma.warehouse.update({
        where: { id },
        data: updateWarehouseDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Warehouse with code ${updateWarehouseDto.code} already exists`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Check if warehouse exists
    await this.findOne(id);
    
    return await this.prisma.warehouse.delete({
      where: { id },
    });
  }
}