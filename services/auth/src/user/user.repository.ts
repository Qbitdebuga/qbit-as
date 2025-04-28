import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

// Since we're using a root-level Prisma schema, we need to use type assertions
type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
    roles?: string[];
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(data.password);

    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        roles: data.roles || ['user']
      }
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      name?: string;
      password?: string;
      roles?: string[];
    },
  ): Promise<User> {
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<User> {
    // @ts-ignore - Using global Prisma schema from root
    return this.prisma.user.delete({
      where: { id }
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
} 