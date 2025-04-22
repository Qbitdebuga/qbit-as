import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ClientsModule } from './clients/clients.module';
import { AggregationModule } from './aggregation/aggregation.module';

@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Import application config module
    AppConfigModule,
    
    // Import service clients module
    ClientsModule,
    
    // Import aggregation module for cross-service endpoints
    AggregationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 