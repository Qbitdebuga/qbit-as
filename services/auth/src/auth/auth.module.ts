import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ServiceAuthGuard } from './guards/service-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { ServiceTokenModule } from '../service-token/service-token.module';
import { ServiceTokenService } from './services/service-token.service';

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