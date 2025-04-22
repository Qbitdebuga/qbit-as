import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceTokenController } from './service-token.controller';
import { ServiceTokenService } from './service-token.service';
import { ServiceTokenClient } from './service-token.client';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SERVICE_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('SERVICE_JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [ServiceTokenController],
  providers: [ServiceTokenService],
  exports: [ServiceTokenService],
})
export class ServiceTokenModule {} 