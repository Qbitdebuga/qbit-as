import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GlobalExceptionFilter } from '@qbit/errors';

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get the config service
  const configService = app.get(ConfigService);

  // Use the Winston logger for Nest
  try {
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  } catch (error: unknown) {
    const err = error as Error;
    console.warn(`Error setting up Winston logger: ${err.message}`);
    console.warn('Falling back to default Nest logger...');
  }

  // Set the global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Set security headers with Helmet
  app.use(helmet());

  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Set up Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Accounts Receivable API')
    .setDescription('API for managing customers, invoices, and payments')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Add a health check endpoint
  app.use('/health', (req: any, res: any) => {
    res.json({
      status: 'ok',
      service: 'accounts-receivable',
      timestamp: new Date().toISOString(),
    });
  });

  // Start the server
  const port = configService.get<number>('app.port', 3002);
  await app.listen(port);
  
  const logger = new NestLogger('Bootstrap');
  logger.log(`Accounts Receivable API is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap(); 