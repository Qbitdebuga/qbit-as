import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LoggerService, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

// Fallback logger in case Winston is not available
class FallbackLogger implements LoggerService {
  private readonly logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  
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
  
  setLogLevels(levels: LogLevel[]) {
    this.logLevels = levels;
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
  app.setGlobalPrefix('api');
  
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
  SwaggerModule.setup('api/docs', app, document);
  
  // Connect to microservices
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmq.url')],
      queue: configService.get<string>('rabbitmq.queue'),
      queueOptions: {
        durable: true,
      },
      exchange: configService.get<string>('rabbitmq.exchange'),
      exchangeOptions: {
        durable: true,
        type: 'topic',
      },
      prefetchCount: 1,
      noAck: false,
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