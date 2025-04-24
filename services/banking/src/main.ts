import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

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
  SwaggerModule.setup('api', app, document);

  // Get the configuration service
  const configService = app.get(ConfigService);
  
  // Get the port from configuration or use default
  const port = configService.get<number>('PORT') || 3007;
  
  // Start the server
  await app.listen(port);
  console.log(`Banking service is running on: http://localhost:${port}`);
}

bootstrap(); 