import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule as AppConfigModule } from './config/config.module.js';
import { ProductsModule } from './products/products.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { EventsModule } from './events/events.module.js';
import { createWinstonLoggerOptions } from './config/logging.config.js';

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