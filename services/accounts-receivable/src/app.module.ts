import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './auth/auth.module';

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
          console.warn(`Winston logger could not be initialized: ${e.message}`);
          return {}; // Return empty config to allow the app to start
        }
      },
    }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    InvoicesModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 