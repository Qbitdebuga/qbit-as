import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors();
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Fixed Assets API')
    .setDescription('API documentation for the Fixed Assets service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // Get port from config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3006);
  
  await app.listen(port);
  console.log(`Fixed Assets service running on port ${port}`);
}

bootstrap(); 