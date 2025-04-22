import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoleModule } from './role/role.module';
import { EventsModule } from './events/events.module';
import { ServiceTokenModule } from './service-token/service-token.module';
import { createWinstonLoggerOptions } from './config/logging.config';
import { HealthModule } from './health/health.module';

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