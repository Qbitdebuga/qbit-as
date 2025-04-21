import { ApiProperty } from '@nestjs/swagger';

export class Role {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  name!: string;

  @ApiProperty({ description: 'Role description', example: 'Administrator with full access' })
  description!: string;

  @ApiProperty({ description: 'List of permissions', example: ['read:users', 'write:users'] })
  permissions!: string[];

  @ApiProperty({ description: 'Account creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last account update date' })
  updatedAt!: Date;

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
} 