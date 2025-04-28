import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string | null;

  @ApiProperty({ description: 'User email address' })
  email!: string | null;

  @ApiProperty({ description: 'User display name' })
  name!: string | null;

  @Exclude()
  password!: string | null;

  @ApiProperty({ description: 'User roles', example: ['user', 'admin'] })
  roles!: string[];

  @ApiProperty({ description: 'Account creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last account update date' })
  updatedAt!: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
} 