import { Module } from '@nestjs/common';
import { AggregationController } from './aggregation.controller.js';
import { AggregationService } from './aggregation.service.js';
import { ClientsModule } from '../clients/clients.module.js';

@Module({
  imports: [ClientsModule],
  controllers: [AggregationController],
  providers: [AggregationService],
  exports: [AggregationService],
})
export class AggregationModule {} 