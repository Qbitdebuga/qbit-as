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
 * Note: Before using this module in production, you need to install the missing dependencies:
 * npm install @nestjs/microservices amqp-connection-manager amqplib
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