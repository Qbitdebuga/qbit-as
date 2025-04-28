import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule as AppConfigModule } from './config/config.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { BillsModule } from './bills/bills.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    
    // Winston Logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
          ),
        }),
        // Add additional transports like file or Elasticsearch here if needed
      ],
    }),
    
    // Core Modules
    AppConfigModule,
    PrismaModule,
    
    // Feature Modules
    VendorsModule,
    ExpensesModule,
    BillsModule,
    PaymentsModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 