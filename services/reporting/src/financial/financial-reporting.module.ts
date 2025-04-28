import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { FinancialReportingService } from './financial-reporting.service.js';
import { FinancialReportingController } from './financial-reporting.controller.js';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
  ],
  controllers: [FinancialReportingController],
  providers: [FinancialReportingService],
  exports: [FinancialReportingService],
})
export class FinancialReportingModule {} 