import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { HealthModule } from './health/health.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard, TokenValidationService, TOKEN_VALIDATION_OPTIONS } from '@qbit/auth-common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AccountsModule,
    HealthModule,
    EventsModule,
    AuthModule,
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