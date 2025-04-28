import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { PrismaHealthIndicator } from './prisma.health.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
  exports: [PrismaHealthIndicator],
})
export class HealthModule {} 