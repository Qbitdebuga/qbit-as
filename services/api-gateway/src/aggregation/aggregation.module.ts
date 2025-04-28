import { Module } from '@nestjs/common';
import { AggregationController } from './aggregation.controller';
import { AggregationService } from './aggregation.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [AggregationController],
  providers: [AggregationService],
  exports: [AggregationService],
})
export class AggregationModule {}
