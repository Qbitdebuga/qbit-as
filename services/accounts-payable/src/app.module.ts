import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { VendorsModule } from './vendors/vendors.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BillsModule } from './bills/bills.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';
import { JwtAuthGuard, TokenValidationService, TOKEN_VALIDATION_OPTIONS } from '@qbit/auth-common';
import { APP_GUARD } from '@nestjs/core';

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
  providers: [
    // Configure the TokenValidationService with JWT settings
    {
      provide: TOKEN_VALIDATION_OPTIONS,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        issuer: configService.get<string>('JWT_ISSUER', 'qbit-auth'),
        audience: configService.get<string>('JWT_AUDIENCE', 'qbit-api'),
      }),
      inject: [ConfigService],
    },
    TokenValidationService,
    // Apply the JWT guard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {} 