import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get the config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3005);
  
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
  
  // Enable CORS
  app.enableCors();
  
  // Set up global logger
  app.useLogger(app.get(Logger));
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Management Service API')
    .setDescription('The Inventory Management Service API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start the application
  await app.listen(port);
  console.log(`Inventory Management service running on port ${port}`);
}
bootstrap(); 