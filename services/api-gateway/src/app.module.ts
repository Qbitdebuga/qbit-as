import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ClientsModule } from './clients/clients.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { GuardsModule } from './guards/guards.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard, TokenValidationService, TOKEN_VALIDATION_OPTIONS } from '@qbit/auth-common';
import { APP_GUARD } from '@nestjs/core';

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
  providers: [
    // Configure the TokenValidationService with JWT settings
    {
      provide: TOKEN_VALIDATION_OPTIONS,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        issuer: configService.get<string>('JWT_ISSUER', 'qbit-auth'),
        audience: configService.get<string>('JWT_AUDIENCE', 'qbit-api'),
      }),
      inject: [ConfigService],
    },
    TokenValidationService,
    // Apply the JWT guard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logger middleware to all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 