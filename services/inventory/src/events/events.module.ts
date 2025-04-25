import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductPublisher, WarehousePublisher, TransactionPublisher } from './publishers';
import { UserConsumer } from './consumers/user-consumer';
import { AccountConsumer } from './consumers/account-consumer';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'INVENTORY_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'inventory_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    ProductPublisher,
    WarehousePublisher,
    TransactionPublisher,
    UserConsumer,
    AccountConsumer,
  ],
  exports: [
    ProductPublisher,
    WarehousePublisher,
    TransactionPublisher,
  ],
})
export class EventsModule {} 