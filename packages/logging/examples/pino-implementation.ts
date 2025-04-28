import { Module, Injectable, Controller, Get, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PinoLoggerService, LoggerModule, PinoLoggerMiddleware } from '@qbit/logging';

/**
 * Example service using Pino logger
 */
@Injectable()
export class ExampleService {
  constructor(private readonly logger: PinoLoggerService) {
    this?.logger.setContext('ExampleService');
  }

  getHello(): string {
    this?.logger.log('Hello method called');
    
    try {
      // Some operation that might fail
      if (Math.random() > 0.7) {
        throw new Error('Random failure for demo');
      }
      
      return 'Hello World!';
    } catch (error) {
      this?.logger.error('Error in getHello method', error.stack, { error: error.message });
      throw error;
    }
  }

  performOperation(data: any): void {
    this?.logger.log('Starting operation', { data });
    
    // Log different levels
    this?.logger.debug('This is a debug message with details', { step: 'initialization' });
    this?.logger.info('Operation in progress');
    
    if (!data.isValid) {
      this?.logger.warn('Invalid data provided', { validation: false, data });
    }
    
    this?.logger.log('Operation completed', { success: true });
  }
}

/**
 * Example controller using the service
 */
@Controller()
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  getHello(): string {
    return this?.service.getHello();
  }
  
  @Get('operation')
  runOperation(): string {
    this?.service.performOperation({ isValid: false, value: 'test' });
    return 'Operation executed';
  }
}

/**
 * Example module configuration
 */
@Module({
  imports: [
    // Configure Pino logger with custom settings
    LoggerModule.forRootPino({
      level: 'debug',
      logDir: 'logs',
      fileName: 'application',
      consoleEnabled: true,
      fileEnabled: true,
      pinoOptions: {
        // Add timestamp to all logs
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        // Add application name to all logs
        base: { app: 'example-service' },
      }
    }),
  ],
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Pino logger middleware to all routes
    consumer.apply(PinoLoggerMiddleware).forRoutes('*');
  }
}

/**
 * Bootstrap the application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS logger since we're using our custom Pino logger
    logger: false,
  });
  
  await app.listen(3000);
  console.log('Application started on port 3000');
}

/**
 * Note: This file is an example and not meant to be executed directly.
 * In a real application, you would use this pattern in your main.ts and module files.
 */ 