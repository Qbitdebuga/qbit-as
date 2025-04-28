import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller.js';
import { PrismaHealthIndicator } from './prisma.health.js';
import { PrismaModule } from '../prisma/prisma.module.js';

/**
 * Health Module
 * 
 * This module provides health check endpoints for monitoring and
 * infrastructure tools to verify service status. It includes checks for:
 * - Database connectivity
 * - Disk usage
 * - Memory usage
 */
@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrismaModule
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
  exports: [PrismaHealthIndicator]
})
export class HealthModule {} 