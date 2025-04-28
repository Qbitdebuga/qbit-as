import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Winston logger may need to be installed manually due to dependency resolution issues
// with shared-types packages in the monorepo
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './prisma/prisma.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { JournalEntriesModule } from './journal-entries/journal-entries.module.js';
import { FinancialStatementsModule } from './financial-statements/financial-statements.module.js';
import { EventsModule } from './events/events.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SagasModule } from './sagas/sagas.module.js';
import { BatchModule } from './batch/batch.module.js';
import { HealthModule } from './health/health.module.js';
import { createWinstonLoggerOptions } from './config/logging.config.js';
import { databaseConfig, appConfig, authConfig, rabbitMQConfig } from './config/configuration.js';

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
  providers: [],
})
export class AppModule {} 