import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to add $on method typing
type ExtendedPrismaClient = PrismaClient & {
  $on: (eventType: string, callback: (event: any) => void) => void;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this?.logger.log('Connecting to the database...');
    await this.$connect();
    this?.logger.log('Connected to the database successfully');

    // Log queries in development mode
    if (process?.env.NODE_ENV === 'development') {
      (this as unknown as ExtendedPrismaClient).$on('query', (e: any) => {
        this?.logger.debug(`Query: ${e.query}`);
        this?.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleDestroy() {
    this?.logger.log('Disconnecting from the database...');
    await this.$disconnect();
    this?.logger.log('Disconnected from the database successfully');
  }
}
