import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountConsumer } from './consumers/account-consumer';
import { JournalEntryConsumer } from './consumers/journal-entry-consumer';
import { AccountEventConsumer } from './consumers/account-event.consumer';
import { UserCreatedListener } from './consumers/user-created-listener';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
            queue: process.env.RABBITMQ_QUEUE || 'accounts_receivable_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    AccountConsumer,
    JournalEntryConsumer, 
    AccountEventConsumer,
    UserCreatedListener
  ],
  exports: [
    AccountConsumer,
    JournalEntryConsumer,
    AccountEventConsumer,
    UserCreatedListener
  ],
})
export class EventsModule {} 