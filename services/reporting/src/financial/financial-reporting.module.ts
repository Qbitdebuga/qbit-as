import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { FinancialReportingService } from './financial-reporting.service';
import { FinancialReportingController } from './financial-reporting.controller';

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