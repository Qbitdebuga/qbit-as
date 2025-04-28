import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Role name', required: false })
  @IsString({ message: 'Role name must be a string' })
  @IsOptional()
  name?: string | null;

  @ApiProperty({ 
    example: 'Administrator with full access', 
    description: 'Role description',
    required: false
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string | null;

  @ApiProperty({ 
    example: ['read:users', 'write:users'], 
    description: 'List of permissions associated with the role',
    required: false
  })
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  @IsOptional()
  permissions?: string[];
} 