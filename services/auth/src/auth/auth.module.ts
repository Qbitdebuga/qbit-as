import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { ServiceAuthGuard } from './guards/service-auth.guard.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';
import { ServiceTokenModule } from '../service-token/service-token.module.js';
import { ServiceTokenService } from './services/service-token.service.js';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ServiceTokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    ServiceAuthGuard,
    AdminAuthGuard,
    ServiceTokenService,
  ],
  exports: [
    AuthService,
    JwtModule,
    ServiceAuthGuard,
    AdminAuthGuard,
  ],
})
export class AuthModule {} 