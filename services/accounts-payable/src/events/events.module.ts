import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserCreatedListener } from './consumers/user-created-listener';
import { AccountConsumer } from './consumers/account-consumer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
            queue: process.env.RABBITMQ_QUEUE || 'accounts_payable_queue',
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
    UserCreatedListener
  ],
  exports: [
    AccountConsumer,
    UserCreatedListener
  ],
})
export class EventsModule {} 