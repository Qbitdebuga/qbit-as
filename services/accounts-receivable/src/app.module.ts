import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import configuration from './config/configuration.js';
import { CustomersModule } from './customers/customers.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './auth/auth.module.js';
import { EventsModule } from './events/events.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Conditionally import WinstonModule to allow the service to start without it
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        try {
          return {
            transports: [
              new winston.transports.Console({
                format: winston.format.combine(
                  winston.format.timestamp(),
                  winston.format.ms(),
                  winston.format.colorize(),
                  winston.format.printf(
                    (info) => `[${info.timestamp}] [${info.level}] [${info.context || 'Accounts-Receivable'}] - ${info.message}`,
                  ),
                ),
              }),
            ],
          };
        } catch (e) {
          console.warn(`Winston logger could not be initialized: ${(e as Error).message}`);
          return {}; // Return empty config to allow the app to start
        }
      },
    }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    InvoicesModule,
    PaymentsModule,
    EventsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 