import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAll(skip = 0, take = 100): Promise<Role[]> {
    const roles = await this.roleRepository.findAll(skip, take);
    return roles.map((role: any) => new Role(role));
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return new Role(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleRepository.findByName(name);

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

    const role = await this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description || '',
      permissions: createRoleDto.permissions || [],
    });

    return new Role(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Check if role exists
    await this.findOne(id);

    const role = await this.roleRepository.update(id, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
      permissions: updateRoleDto.permissions,
    });

    return new Role(role);
  }

  async remove(id: string): Promise<void> {
    // Check if role exists
    await this.findOne(id);

    await this.roleRepository.delete(id);
  }
} 