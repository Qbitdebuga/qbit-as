import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceTokenController } from './service-token.controller.js';
import { ServiceTokenService } from './service-token.service.js';
import { ServiceTokenClient } from './service-token.client.js';

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