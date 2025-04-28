import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: configService.get<string>('NODE_ENV') === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (this?.configService.get<string>('NODE_ENV') === 'test') {
      // Only allow this in test environment
      const models = Reflect.ownKeys(this).filter((key) => {
        return typeof key === 'string' && !key.startsWith('_') && !['$connect', '$disconnect', '$on', '$transaction', '$use'].includes(key as string);
      });

      return Promise.all(
        models.map((modelKey) => {
          return this[modelKey as string].deleteMany();
        }),
      );
    }
  }
} 