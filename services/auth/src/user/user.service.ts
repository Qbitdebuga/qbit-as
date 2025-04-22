import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip = 0, take = 100): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      skip,
      take,
    });
    return users.map((user: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as User;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        roles: createUserDto.roles || ['user'],
      } as any,
    });

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    // Check if email is being changed and if it's already in use
    if (updateUserDto.email) {
      const userWithEmail = await this.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
      }
    }

    // Hash password if it's being updated
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }
} 