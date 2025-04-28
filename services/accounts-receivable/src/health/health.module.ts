import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller.js';
import { PrismaHealthIndicator } from './prisma.health.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrismaModule
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {} 