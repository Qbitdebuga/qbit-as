import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from '@qbit/errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors();

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('QBit Banking Service API')
    .setDescription('Banking & Reconciliation microservice for QBit Accounting System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Get the configuration service
  const configService = app.get(ConfigService);
  
  // Get the port from configuration or use default
  const port = configService.get<number>('PORT') || 3007;
  
  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Start the server
  await app.listen(port);
  console.log(`Banking service is running on: http://localhost:${port}`);
}

bootstrap(); 