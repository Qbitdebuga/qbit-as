import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple query to check database connectivity
      await this.prismaService.$queryRaw`SELECT 1`;
      
      return this.getStatus(key, true);
    } catch (error: any) {
      throw new HealthCheckError(
        'Prisma Health Check Failed',
        this.getStatus(key, false, { error: error.message })
      );
    }
  }
} 