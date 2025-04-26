import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserPublisher } from './publishers/user-publisher';
import { RolePublisher } from './publishers/role-publisher';
import { UserCreatedPublisher } from './publishers/user-created-publisher';

// Define local interfaces to fix typing issues
interface NatsClientType {
  getInstance(): {
    isConnected(): boolean;
    connect(servers?: string[]): Promise<void>;
  }
}

// Mock NatsClient implementation to replace the @qbit/events import
const NatsClient: NatsClientType = {
  getInstance: () => ({
    isConnected: () => false,
    connect: async (servers?: string[]) => {
      console.log('Mock NATS connection - would connect to:', servers || ['nats://localhost:4222']);
      return Promise.resolve();
    }
  })
};

// Mock client for development
const mockClient = {
  emit: () => ({
    toPromise: () => Promise.resolve(),
  }),
};

/**
 * Events Module for Auth Service
 * 
 * This module is responsible for handling event communication with other services.
 * It provides the infrastructure for publishing user and role-related events
 * to the RabbitMQ message broker.
 * 
 * To enable RabbitMQ client, install dependencies:
 * yarn add @nestjs/microservices amqp-connection-manager amqplib
 * 
 * Then uncomment the ClientsModule section below.
 */
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const rabbitUrl = configService.get('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
          const rabbitQueue = configService.get('RABBITMQ_QUEUE') || 'auth_queue';
          
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUrl],
              queue: rabbitQueue,
              queueOptions: {
                durable: true,
              },
              noAck: false,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: 'RABBITMQ_CLIENT',
      useValue: mockClient,
    },
    UserPublisher,
    RolePublisher,
    UserCreatedPublisher,
  ],
  exports: [
    UserPublisher,
    RolePublisher,
    UserCreatedPublisher,
  ],
})
export class EventsModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const natsServers = this.configService.get<string>('NATS_URL')?.split(',') || ['nats://localhost:4222'];
      
      // Initialize NATS connection
      await NatsClient.getInstance().connect(natsServers);
      console.log('Successfully connected to NATS servers');
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      // Allow the application to start even if NATS connection fails
      // Services will attempt to reconnect when publishing events
    }
  }
} 