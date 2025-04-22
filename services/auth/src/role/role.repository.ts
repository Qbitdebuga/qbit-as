import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Since we're using a root-level Prisma schema, we need to use type assertions
type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class RoleRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 100): Promise<Role[]> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.findMany({
      skip,
      take,
    });
  }

  async findById(id: string): Promise<Role | null> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description || '',
        permissions: data.permissions || [],
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    },
  ): Promise<Role> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Role> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.role.delete({
      where: { id },
    });
  }
} 