import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip = 0, take = 100): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      skip,
      take,
    });
    return roles.map((role: any) => new Role(role));
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return new Role(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role) {
      return null;
    }

    return new Role(role);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with this name already exists
    const existingRole = await this.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException(`Role with name ${createRoleDto.name} already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description || '',
        permissions: createRoleDto.permissions || [],
      },
    });

    return new Role(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Check if role exists
    await this.findOne(id);

    // Check if name is being changed and if it's already in use
    if (updateRoleDto.name) {
      const roleWithName = await this.findByName(updateRoleDto.name);
      if (roleWithName && roleWithName.id !== id) {
        throw new ConflictException(`Role with name ${updateRoleDto.name} already exists`);
      }
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return new Role(role);
  }

  async remove(id: string): Promise<void> {
    // Check if role exists
    await this.findOne(id);

    await this.prisma.role.delete({
      where: { id },
    });
  }
} 