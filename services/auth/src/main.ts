import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GlobalExceptionFilter } from '@qbit/errors';

async function bootstrap() {
  // Create the application instance
  const app = await NestFactory.create(AppModule, {
    // Will be replaced with Winston logger
    bufferLogs: true,
  });

  // Use Winston for application logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Get config service
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Enable security headers
  app.use(helmet());

  // Enable CORS for frontend
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Qbit Auth API')
    .setDescription('API documentation for Qbit authentication service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // Start the server
  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  app.get(WINSTON_MODULE_NEST_PROVIDER).log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 