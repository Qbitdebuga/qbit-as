import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRepository } from './user.repository.js';
import { UserPublisher } from '../events/publishers/user-publisher.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPublisher: UserPublisher,
  ) {}

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

    // Publish user created event
    await this.userPublisher.publishUserCreated(user);

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists and get previous data
    const previousUser = await this.findById(id);

    const user = await this.userRepository.update(id, {
      email: updateUserDto.email,
      name: updateUserDto.name,
      password: updateUserDto.password,
      roles: updateUserDto.roles,
    });

    // Publish user updated event
    await this.userPublisher.publishUserUpdated(user, previousUser);

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists and get user data before deletion
    const user = await this.findById(id);
    
    // Delete the user
    await this.userRepository.delete(id);
    
    // Publish user deleted event
    await this.userPublisher.publishUserDeleted(id, user);
  }
} 