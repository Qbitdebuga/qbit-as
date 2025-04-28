import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RoleModule } from './role/role.module.js';
import { EventsModule } from './events/events.module.js';
import { ServiceTokenModule } from './service-token/service-token.module.js';
import { createWinstonLoggerOptions } from './config/logging.config.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Configure Winston logger
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => 
        createWinstonLoggerOptions(configService),
    }),
    
    // Import application modules
    PrismaModule,
    EventsModule,
    UserModule,
    RoleModule,
    AuthModule,
    ServiceTokenModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 