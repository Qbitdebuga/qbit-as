import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { AggregationModule } from './aggregation/aggregation.module.js';
import { GuardsModule } from './guards/guards.module.js';
import { MiddlewareModule } from './middleware/middleware.module.js';
import { LoggerMiddleware } from './middleware/logger.middleware.js';
import { HealthModule } from './health/health.module.js';

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
    
    // Import guards module
    GuardsModule,
    
    // Import middleware module
    MiddlewareModule,
    
    // Import aggregation module for cross-service endpoints
    AggregationModule,
    
    // Import health module for health checks
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logger middleware to all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 