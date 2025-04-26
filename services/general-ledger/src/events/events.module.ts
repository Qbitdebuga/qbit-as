import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountPublisher } from './publishers/account-publisher';
import { JournalEntryPublisher } from './publishers/journal-entry-publisher';
import { UserConsumer } from './consumers/user-consumer';
import { RoleConsumer } from './consumers/role-consumer';
import { PrismaModule } from '../prisma/prisma.module';
import { UserCreatedListener } from './consumers/user-created-listener';
import { NatsClient } from '@qbit/events';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: configService.get<string>('RABBITMQ_QUEUE') || 'general_ledger_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'JOURNAL_ENTRY_SERVICE_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || ''],
            queue: configService.get<string>('JOURNAL_ENTRY_QUEUE') || 'journal_entry_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ACCOUNT_SERVICE_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || ''],
            queue: configService.get<string>('ACCOUNT_QUEUE') || 'account_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    AccountPublisher,
    JournalEntryPublisher,
    UserConsumer,
    RoleConsumer,
    UserCreatedListener,
  ],
  exports: [
    AccountPublisher,
    JournalEntryPublisher,
    UserConsumer,
    RoleConsumer,
    UserCreatedListener,
  ],
})
export class EventsModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const natsServers = this.configService.get<string>('NATS_URL')?.split(',') || ['nats://localhost:4222'];
      
      // Initialize NATS connection
      if (!NatsClient.getInstance().isConnected()) {
        await NatsClient.getInstance().connect(natsServers);
        console.log('Successfully connected to NATS servers');
      }
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      // Allow the application to start even if NATS connection fails
      // Services will attempt to reconnect when publishing events
    }
  }
} 