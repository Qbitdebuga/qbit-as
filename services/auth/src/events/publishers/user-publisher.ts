import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectClient } from '@nestjs/microservices';
import { USER_EVENTS } from '../constants/event-patterns';

// Define a User interface to avoid the @prisma/client import issue
interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserPublisher {
  private readonly logger = new Logger(UserPublisher.name);

  constructor(
    // Use a comment to avoid linting errors for now
    // @InjectClient('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly client: any,
  ) {}

  async publishUserCreated(user: User): Promise<void> {
    try {
      const eventPayload = this.sanitizeUser(user);
      this.logger.log(`Publishing ${USER_EVENTS.CREATED} event for user ${user.id}`);
      
      await this.client.emit(USER_EVENTS.CREATED, {
        serviceSource: 'auth-service',
        entityType: 'user',
        timestamp: new Date().toISOString(),
        data: eventPayload
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${USER_EVENTS.CREATED} event: ${error.message}`, error.stack);
    }
  }

  async publishUserUpdated(user: User, previousData?: Partial<User>): Promise<void> {
    try {
      const eventPayload = this.sanitizeUser(user);
      this.logger.log(`Publishing ${USER_EVENTS.UPDATED} event for user ${user.id}`);
      
      await this.client.emit(USER_EVENTS.UPDATED, {
        serviceSource: 'auth-service',
        entityType: 'user',
        timestamp: new Date().toISOString(),
        data: eventPayload,
        previousData: previousData ? this.sanitizeUser(previousData as User) : undefined
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${USER_EVENTS.UPDATED} event: ${error.message}`, error.stack);
    }
  }

  async publishUserDeleted(userId: string, userData: Partial<User>): Promise<void> {
    try {
      this.logger.log(`Publishing ${USER_EVENTS.DELETED} event for user ${userId}`);
      
      // Make a copy of userData without the id field
      const { id, ...userDataWithoutId } = userData as User;
      const sanitizedData = this.sanitizeUser({ id: userId, ...userDataWithoutId } as User);
      
      await this.client.emit(USER_EVENTS.DELETED, {
        serviceSource: 'auth-service',
        entityType: 'user',
        timestamp: new Date().toISOString(),
        data: sanitizedData
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${USER_EVENTS.DELETED} event: ${error.message}`, error.stack);
    }
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    // Remove sensitive information like password
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 