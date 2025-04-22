import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Enable more detailed logs
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    abortOnError: false,
  });

  // Get config service
  const configService = app.get(ConfigService);

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

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Qbit Auth API')
    .setDescription('API documentation for Qbit authentication service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start the server
  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 