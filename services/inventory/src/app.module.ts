import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventsModule } from './events/events.module';
import { createWinstonLoggerOptions } from './config/logging.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    
    // Event Emitter
    EventEmitterModule.forRoot(),
    
    // Winston Logger
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => 
        createWinstonLoggerOptions(configService),
    }),
    
    // Core Modules
    AppConfigModule,
    PrismaModule,
    EventsModule,
    
    // Feature Modules
    ProductsModule,
    WarehousesModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 