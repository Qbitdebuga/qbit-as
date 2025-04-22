import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

interface UserCreatedEvent {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  serviceSource: string;
  entityType: string;
  timestamp: string;
}

interface UserUpdatedEvent {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  serviceSource: string;
  entityType: string;
  timestamp: string;
}

interface UserDeletedEvent {
  id: string;
  serviceSource: string;
  entityType: string;
  timestamp: string;
}

/**
 * Consumer for user events from the Auth Service
 */
@Injectable()
export class UserConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Setup event connections when the module initializes
   */
  async onModuleInit() {
    this.logger.log('User event consumer initialized');
  }

  /**
   * Handle user.created events
   */
  @EventPattern('user.created')
  async handleUserCreated(@Payload() event: UserCreatedEvent, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received user.created event for user ${event.id}`);
      
      // Example implementation - store a reference to the user
      // Check if the user already exists in our local db
      const existingUser = await this.prisma.$queryRaw`
        SELECT * FROM user_references WHERE external_id = ${event.id}
      `;

      if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
        // Create a new user reference record
        await this.prisma.$executeRaw`
          INSERT INTO user_references (
            id, 
            external_id, 
            email, 
            name, 
            is_admin, 
            metadata, 
            created_at, 
            updated_at
          ) VALUES (
            ${crypto.randomUUID()}, 
            ${event.id}, 
            ${event.email}, 
            ${event.name || null}, 
            ${event.roles.includes('admin')}, 
            ${JSON.stringify({
              roles: event.roles,
              source: event.serviceSource,
            })}, 
            NOW(), 
            NOW()
          )
        `;
        this.logger.log(`Created local reference for user ${event.id}`);
      }
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling user.created event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle user.updated events
   */
  @EventPattern('user.updated')
  async handleUserUpdated(@Payload() event: UserUpdatedEvent, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received user.updated event for user ${event.id}`);
      
      try {
        // Update the user reference record
        const result = await this.prisma.$executeRaw`
          UPDATE user_references 
          SET 
            email = ${event.email}, 
            name = ${event.name || null}, 
            is_admin = ${event.roles.includes('admin')}, 
            metadata = ${JSON.stringify({
              roles: event.roles,
              source: event.serviceSource,
              lastUpdated: event.timestamp,
            })},
            updated_at = NOW()
          WHERE external_id = ${event.id}
        `;
        
        // If no rows were affected, the user doesn't exist
        if (result === 0) {
          throw { code: 'P2025' }; // Simulate Prisma's not found error
        }
        
        this.logger.log(`Updated local reference for user ${event.id}`);
      } catch (dbError: any) {
        this.logger.error(`Failed to update user reference: ${dbError.message}`, dbError.stack);
        // If the user doesn't exist, create it
        if (dbError.code === 'P2025') { // Prisma record not found error
          this.logger.log(`User reference not found, creating new record for user ${event.id}`);
          await this.prisma.$executeRaw`
            INSERT INTO user_references (
              id, 
              external_id, 
              email, 
              name, 
              is_admin, 
              metadata, 
              created_at, 
              updated_at
            ) VALUES (
              ${crypto.randomUUID()}, 
              ${event.id}, 
              ${event.email}, 
              ${event.name || null}, 
              ${event.roles.includes('admin')}, 
              ${JSON.stringify({
                roles: event.roles,
                source: event.serviceSource,
              })}, 
              NOW(), 
              NOW()
            )
          `;
        } else {
          throw dbError;
        }
      }
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling user.updated event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle user.deleted events
   */
  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() event: UserDeletedEvent, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received user.deleted event for user ${event.id}`);
      
      try {
        // Delete the user reference record
        const result = await this.prisma.$executeRaw`
          DELETE FROM user_references WHERE external_id = ${event.id}
        `;
        
        // If no rows were affected, the user doesn't exist
        if (result === 0) {
          throw { code: 'P2025' }; // Simulate Prisma's not found error
        }
        
        this.logger.log(`Deleted local reference for user ${event.id}`);
      } catch (dbError: any) {
        // If the user doesn't exist, just log it
        if (dbError.code === 'P2025') { // Prisma record not found error
          this.logger.log(`No local reference found for deleted user ${event.id}`);
        } else {
          this.logger.error(`Failed to delete user reference: ${dbError.message}`, dbError.stack);
          throw dbError;
        }
      }
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling user.deleted event: ${error.message}`, error.stack);
    }
  }
} 