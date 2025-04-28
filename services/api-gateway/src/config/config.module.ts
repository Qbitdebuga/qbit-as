import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { serviceConfigSchema } from './schemas/service-config.schema';
import { authConfigSchema } from './schemas/auth-config.schema';

/**
 * Configuration module for the API Gateway application
 * Provides validation for required configuration values
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: serviceConfigSchema.concat(authConfigSchema),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      cache: true,
      isGlobal: true,
    }),
  ],
  providers: [],
  exports: [],
})
export class ConfigModule {}
