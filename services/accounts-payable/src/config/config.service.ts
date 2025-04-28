import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get databaseUrl(): string {
    return this?.configService.get<string>('DATABASE_URL');
  }

  get port(): number {
    return this?.configService.get<number>('PORT', 3004);
  }

  get jwtSecret(): string {
    return this?.configService.get<string>('JWT_SECRET');
  }

  get serviceJwtSecret(): string {
    return this?.configService.get<string>('SERVICE_JWT_SECRET');
  }

  get rabbitmqUrl(): string {
    return this?.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
  }

  get logstashUrl(): string {
    return this?.configService.get<string>('LOGSTASH_URL', 'localhost:5000');
  }
}
