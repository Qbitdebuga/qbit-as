import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Configure validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors();

  // Get config service for environment variables
  const configService = app.get(ConfigService);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Reporting Service API')
    .setDescription('API documentation for the Reporting Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Start the server
  const port = configService.get<number>('PORT', 3004);
  await app.listen(port);
  console.log(`Reporting service is running on: http://localhost:${port}`);
}

bootstrap(); 