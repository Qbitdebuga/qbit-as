import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsMsg } from 'nats';
// Import the NATS client directly if @qbit/events is not available
import { PrismaService } from '../../prisma/prisma.service';

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

@Injectable()
export class UserCreatedListener implements OnModuleInit {
  private readonly logger = new Logger(UserCreatedListener.name);
  readonly queueGroup = 'general-ledger-service';
  readonly subject = 'user.created';
  
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      const natsServers = this.configService.get<string>('NATS_URL')?.split(',') || ['nats://localhost:4222'];
      
      // Connect to NATS if not already connected
      if (!NatsClient.getInstance().isConnected()) {
        await NatsClient.getInstance().connect(natsServers);
        this.logger.log('Connected to NATS servers');
      }
      
      // Start listening for user created events
      await this.listen();
      this.logger.log(`Listening for ${this.subject} events on queue ${this.queueGroup}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to initialize user created listener: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Start listening for events (mock implementation)
   */
  async listen(): Promise<void> {
    this.logger.log(`Started listening for ${this.subject} events (mock implementation)`);
    // In production, implement actual NATS listener using @qbit/events package
  }

  /**
   * Handle incoming user created events
   * @param data User data from the event
   * @param msg NATS message
   */
  async onMessage(data: any, msg: JsMsg): Promise<void> {
    try {
      this.logger.log(`Received user created event for user ${data.id}`);
      
      // Check if user already exists in our local database
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: data.id },
      });
      
      if (existingUser) {
        this.logger.log(`User ${data.id} already exists in local database, skipping`);
        msg.ack();
        return;
      }
      
      // Create user in our local database
      await this.prismaService.user.create({
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          roles: data.roles,
        },
      });
      
      this.logger.log(`Successfully created user ${data.id} in local database`);
      msg.ack();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing user created event: ${errorMessage}`, errorStack);
      // Negative acknowledge will cause the message to be redelivered
      msg.nak();
    }
  }
} 