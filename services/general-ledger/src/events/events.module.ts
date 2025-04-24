import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountPublisher } from './publishers/account-publisher';
import { JournalEntryPublisher } from './publishers/journal-entry-publisher';
import { UserConsumer } from './consumers/user-consumer';
import { RoleConsumer } from './consumers/role-consumer';
import { PrismaModule } from '../prisma/prisma.module';

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
    ]),
  ],
  providers: [AccountPublisher, JournalEntryPublisher, UserConsumer, RoleConsumer],
  exports: [AccountPublisher, JournalEntryPublisher],
})
export class EventsModule {} 