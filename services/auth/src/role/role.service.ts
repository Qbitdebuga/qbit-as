import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './role.repository';
import { RolePublisher } from '../events/publishers/role-publisher';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePublisher: RolePublisher
  ) {}

  async findAll(skip = 0, take = 100): Promise<Role[]> {
    const roles = await this?.roleRepository.findAll(skip, take);
    return roles.map((role: any) => new Role(role));
  }

  async findOne(id: string): Promise<Role> {
    const role = await this?.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return new Role(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this?.roleRepository.findByName(name);

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

    const role = await this?.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description || '',
      permissions: createRoleDto.permissions || [],
    });

    // Publish role created event
    await this?.rolePublisher.publishRoleCreated(role);

    return new Role(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Check if role exists and get previous data
    const previousRole = await this.findOne(id);

    const role = await this?.roleRepository.update(id, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
      permissions: updateRoleDto.permissions,
    });

    // Publish role updated event
    await this?.rolePublisher.publishRoleUpdated(role, previousRole);

    return new Role(role);
  }

  async remove(id: string): Promise<void> {
    // Check if role exists and get role data before deletion
    const role = await this.findOne(id);
    
    // Delete the role
    await this?.roleRepository.delete(id);
    
    // Publish role deleted event
    await this?.rolePublisher.publishRoleDeleted(id, role);
  }
} 