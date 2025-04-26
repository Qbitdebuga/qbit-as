import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import { GlobalExceptionFilter } from '@qbit/errors';
import { PinoLoggerService } from '@qbit/logging';

async function bootstrap() {
  // Create custom logger
  const logger = new PinoLoggerService({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    logDir: 'logs',
    fileName: 'api-gateway',
  });
  logger.setContext('API-Gateway');

  // Create the application with custom logger
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Enable CORS
  app.enableCors();
  
  // Use Helmet for security headers
  app.use(helmet());
  
  // Use validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Qbit Accounting API')
    .setDescription('The Qbit Accounting System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  
  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req: Request, res: Response) => {
    (res as any).status(200).send('OK');
  });
  
  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap(); 