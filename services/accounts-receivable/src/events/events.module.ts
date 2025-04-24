import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomerPublisher } from './publishers/customer-publisher';
import { AccountEventConsumer } from './consumers/account-event.consumer';

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
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
            queue: configService.get<string>('RABBITMQ_QUEUE') || 'accounts_receivable_queue',
            queueOptions: {
              durable: true,
            },
            noAck: false,
            prefetchCount: 1,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    CustomerPublisher,
    AccountEventConsumer,
  ],
  exports: [
    CustomerPublisher,
  ],
})
export class EventsModule {} 