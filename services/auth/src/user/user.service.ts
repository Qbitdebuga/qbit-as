import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(skip = 0, take = 100): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users.map((user: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);

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

    const user = await this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: createUserDto.password,
      roles: createUserDto.roles || ['user'],
    });

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    const user = await this.userRepository.update(id, {
      email: updateUserDto.email,
      name: updateUserDto.name,
      password: updateUserDto.password,
      roles: updateUserDto.roles,
    });

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);
    await this.userRepository.delete(id);
  }
} 