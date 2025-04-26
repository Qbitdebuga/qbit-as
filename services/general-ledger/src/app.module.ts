import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Winston logger may need to be installed manually due to dependency resolution issues
// with shared-types packages in the monorepo
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { FinancialStatementsModule } from './financial-statements/financial-statements.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { SagasModule } from './sagas/sagas.module';
import { BatchModule } from './batch/batch.module';
import { HealthModule } from './health/health.module';
import { createWinstonLoggerOptions } from './config/logging.config';
import { databaseConfig, appConfig, authConfig, rabbitMQConfig } from './config/configuration';
import { JwtAuthGuard, TokenValidationService, TOKEN_VALIDATION_OPTIONS } from '@qbit/auth-common';
import { APP_GUARD } from '@nestjs/core';

// If Winston is not available, this module can be conditionally imported
// using dynamic imports or reflection to prevent build errors

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [databaseConfig, appConfig, authConfig, rabbitMQConfig],
    }),
    
    // Configure Winston logger
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => 
        createWinstonLoggerOptions(configService),
    }),
    
    // Import the PrismaModule for database access
    PrismaModule,
    // Import the Events Module for event publishing
    EventsModule,
    // Import Auth Module for service authentication
    AuthModule,
    // Import the AccountsModule for chart of accounts functionality
    AccountsModule,
    JournalEntriesModule,
    FinancialStatementsModule,
    SagasModule,
    BatchModule,
    // Import Health Module for service monitoring
    HealthModule,
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