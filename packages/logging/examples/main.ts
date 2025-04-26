import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PinoLoggerService } from '@qbit/logging';
import { AppModule } from './app.module';

/**
 * Bootstrap the application
 * This is an example of how to integrate Pino logger in a NestJS microservice
 */
async function bootstrap() {
  // Create the application with Pino logger
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS logger since we're using our custom Pino logger
    logger: false,
  });

  // Get the Pino logger instance from the app context
  const logger = app.get(PinoLoggerService);
  logger.setContext('Bootstrap');

  try {
    // Configure global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    // Enable CORS
    app.enableCors();

    // Swagger API documentation setup
    const config = new DocumentBuilder()
      .setTitle('Qbit Microservice')
      .setDescription('API documentation for the Qbit microservice')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Start the application
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📝 API documentation available at: http://localhost:${port}/api`);
  } catch (error: any) {
    logger.error('Failed to start application', error?.stack || '', { 
      error: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available'
    });
    process.exit(1);
  }
}

bootstrap(); 