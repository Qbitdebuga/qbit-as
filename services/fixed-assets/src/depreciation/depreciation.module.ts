import { Module } from '@nestjs/common';
import { DepreciationController } from './depreciation.controller.js';
import { DepreciationService } from './depreciation.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DepreciationController],
  providers: [DepreciationService],
  exports: [DepreciationService],
})
export class DepreciationModule {} 