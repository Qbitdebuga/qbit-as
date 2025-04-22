import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SagasModule } from '../sagas/sagas.module';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';

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