import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountPublisher } from './publishers/account-publisher.js';
import { JournalEntryPublisher } from './publishers/journal-entry-publisher.js';
import { UserConsumer } from './consumers/user-consumer.js';
import { RoleConsumer } from './consumers/role-consumer.js';
import { PrismaModule } from '../prisma/prisma.module.js';

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
            urls: [configService.get<string>('RABBITMQ_URL') || ''],
            queue: configService.get<string>('RABBITMQ_QUEUE') || 'general_ledger_queue',
            queueOptions: {
              durable: true,
            },
            exchange: configService.get<string>('RABBITMQ_EXCHANGE') || 'qbit_events',
            exchangeOptions: {
              durable: true,
              type: 'topic',
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
  providers: [AccountPublisher, JournalEntryPublisher, UserConsumer, RoleConsumer],
  exports: [AccountPublisher, JournalEntryPublisher],
})
export class EventsModule {} 