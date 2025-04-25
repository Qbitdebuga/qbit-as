import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LoggerService, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

// Fallback logger in case Winston is not available
class FallbackLogger implements LoggerService {
  constructor(private readonly prefix: string = 'General-Ledger') {}
  
  log(message: any, context?: string) {
    console.log(`[${this.prefix}] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  error(message: any, trace?: string, context?: string) {
    console.error(`[${this.prefix}] ${context ? `[${context}] ` : ''}${message}${trace ? `\n${trace}` : ''}`);
  }
  
  warn(message: any, context?: string) {
    console.warn(`[${this.prefix}] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  debug(message: any, context?: string) {
    console.debug(`[${this.prefix}] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  verbose(message: any, context?: string) {
    console.log(`[VERBOSE] [${this.prefix}] ${context ? `[${context}] ` : ''}${message}`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  let logger;
  
  try {
    // Try to use Winston logger if available
    logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
  } catch (error) {
    // Fallback to basic logger if Winston is not available
    logger = new FallbackLogger();
    app.useLogger(logger);
    logger.warn('Winston logger not available, using fallback logger');
  }
  
  const configService = app.get(ConfigService);
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Enable security middleware
  app.use(helmet());
  
  // Enable CORS
  app.enableCors();
  
  // Set up global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('General Ledger API')
    .setDescription('The General Ledger service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  
  // Simple health check endpoint for Kubernetes probes
  app.use('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });
  
  // Connect to microservices
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmq.url')],
      queue: configService.get<string>('rabbitmq.queue'),
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
    },
  });
  
  // Start microservices
  await app.startAllMicroservices();
  
  // Start the server
  const port = configService.get<number>('app.port') || 3003;
  await app.listen(port);
  logger.log(`General Ledger service running on port ${port}`);
  logger.log(`Microservice listening for events on ${configService.get<string>('rabbitmq.queue')} queue`);
}

bootstrap(); 