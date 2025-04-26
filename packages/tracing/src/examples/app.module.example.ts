/**
 * This is an example file showing how to configure the TracingModule in your AppModule.
 * 
 * Note: This example doesn't include actual imports from specific modules since this
 * is just a demonstration. You would need to adapt this to your project structure.
 */

// In a real application, your imports would look something like this:
// import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { WinstonModule } from 'nest-winston';
// Import our tracing module and middleware
import { TracingModule, TracingMiddleware } from '../index';

// Example of a basic AppModule that includes the TracingModule
/*
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Configure Winston logger (optional but recommended for logs)
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService) => 
        createWinstonLoggerOptions(configService),
    }),
    
    // Configure OpenTelemetry tracing with async config from ConfigService
    TracingModule.forRootAsync(),
    
    // Your application modules
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer) {
    // Apply tracing middleware to all routes
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
*/

// Export example import for documentation
export { TracingModule, TracingMiddleware }; 