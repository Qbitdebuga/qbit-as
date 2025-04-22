import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// Interface for Query Event
interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Connected to database successfully');

    // Add middleware for logging
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      this.logger.debug(
        `Query ${params.model}.${params.action} took ${after - before}ms`,
      );
      return result;
    });

    // Log slow queries
    // @ts-ignore - Ignore type checking for this event listener
    this.$on('query', (e: QueryEvent) => {
      if (e.duration >= 200) { // Log queries taking more than 200ms
        this.logger.warn(`Slow query: ${e.query} (${e.duration}ms)`);
      }
    });
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('This method cannot be executed in production');
    }

    const models = Reflect.ownKeys(this).filter((key) => {
      return typeof key === 'string' && 
        !key.startsWith('_') && 
        !['$connect', '$disconnect', '$on', '$transaction', '$use'].includes(key as string);
    });

    return this.$transaction(
      models.map((model) => {
        const modelName = model as string;
        return (this[modelName as keyof this] as unknown as { deleteMany: () => any }).deleteMany();
      })
    );
  }
} 