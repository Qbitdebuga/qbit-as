import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@qbit/errors';
import { PinoLoggerService as LoggerService } from '@qbit/logging';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Create custom logger
  const logger = new LoggerService({
    level: process?.env.NODE_ENV === 'production' ? 'info' : 'debug',
    logDir: 'logs',
    fileName: 'accounts-payable',
  });
  logger.setContext('AccountsPayable');

  // Create the application with custom logger
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });

  // Get the config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3004);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors();

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Accounts Payable Service API')
    .setDescription('The Accounts Payable Service API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Start the application
  await app.listen(port);
  logger.log(`Accounts Payable service running on port ${port}`);
}
bootstrap();
