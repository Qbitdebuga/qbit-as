import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  /**
   * Checks if the database is healthy by executing a simple query
   * @param key The key which will be used for the result object
   * @returns HealthIndicatorResult with the database status
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple query to check if database is responding
      await this.prismaService.$queryRaw`SELECT 1`;
      return this.getStatus(key, true, { database: 'postgres' });
    } catch (error: any) {
      throw new HealthCheckError(
        'Prisma health check failed',
        this.getStatus(key, false, {
          database: 'postgres',
          error: error.message || 'Unknown database error',
        }),
      );
    }
  }
} 