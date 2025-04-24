import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  SwaggerModule.setup('api', app, document);

  // Get port from config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3006);
  
  await app.listen(port);
  console.log(`Fixed Assets service running on port ${port}`);
}

bootstrap(); 