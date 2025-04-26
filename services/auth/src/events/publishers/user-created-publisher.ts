import { Injectable, Logger } from '@nestjs/common';
// Replace User import with a generic user interface
// Remove import { User } from '@prisma/client';

// Define User interface to match expected structure
interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // For other properties
}

// Define local interfaces to fix typing issues
interface NatsClientType {
  getInstance(): {
    isConnected(): boolean;
    connect(servers?: string[]): Promise<void>;
  }
}

// Mock NatsClient until proper package is available
const NatsClient: NatsClientType = {
  getInstance: () => ({
    isConnected: () => false,
    connect: async () => {
      console.log('Mock NATS connection - in production, install @qbit/events package');
    }
  })
};

// Simple publisher class to replace the one from @qbit/events
class BaseUserCreatedPublisher {
  readonly subject = 'user.created';
  
  async publish(data: any): Promise<void> {
    console.log(`[MOCK] Publishing to ${this.subject}:`, data);
    // In production, implement actual NATS publishing using @qbit/events package
  }
}

@Injectable()
export class UserCreatedPublisher {
  private readonly logger = new Logger(UserCreatedPublisher.name);
  private publisher: BaseUserCreatedPublisher;

  constructor() {
    this.publisher = new BaseUserCreatedPublisher();
  }

  /**
   * Publish a user created event to NATS
   * @param user The user that was created
   */
  async publish(user: User): Promise<void> {
    try {
      const { password, ...userData } = user;
      
      this.logger.log(`Publishing user.created event for user ${user.id}`);
      
      await this.publisher.publish({
        ...userData,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
      
      this.logger.log(`Successfully published user.created event for user ${user.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to publish user.created event: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Ensure the publisher is connected to NATS
   */
  async ensureConnection(): Promise<void> {
    try {
      if (!NatsClient.getInstance().isConnected()) {
        await NatsClient.getInstance().connect();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to connect to NATS: ${errorMessage}`, errorStack);
    }
  }
} 