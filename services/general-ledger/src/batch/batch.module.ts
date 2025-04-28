import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SagasModule } from '../sagas/sagas.module.js';
import { BatchService } from './batch.service.js';
import { BatchController } from './batch.controller.js';

@Module({
  imports: [
    PrismaModule,
    SagasModule,
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {} 