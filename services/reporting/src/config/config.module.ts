import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchemaValidation, databaseConfig, appConfig, authConfig, rabbitMQConfig } from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchemaValidation,
      load: [databaseConfig, appConfig, authConfig, rabbitMQConfig],
    }),
  ],
})
export class ConfigModule {} 