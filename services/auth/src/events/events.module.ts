import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserPublisher } from './publishers/user-publisher';
import { RolePublisher } from './publishers/role-publisher';

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
    // Temporarily commented out until microservices dependencies are fully set up
    /*
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE'),
            queueOptions: {
              durable: true,
            },
            persistent: true,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    */
  ],
  providers: [
    {
      provide: 'RABBITMQ_CLIENT',
      useValue: mockClient,
    },
    UserPublisher, 
    RolePublisher
  ],
  exports: [UserPublisher, RolePublisher],
})
export class EventsModule {
  constructor(private configService: ConfigService) {
    // Log a warning that microservices dependencies need to be installed
    console.warn(
      'WARNING: EventsModule is loaded in development mode. ' +
      'For production use, install @nestjs/microservices and related dependencies.',
    );
  }
} 