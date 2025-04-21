import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        roles: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
    roles?: { connect: { id: string }[] };
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        roles: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      name?: string;
      password?: string;
      roles?: { connect: { id: string }[] } | { set: { id: string }[] };
    },
  ): Promise<User> {
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: true,
      },
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
      include: {
        roles: true,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
} 