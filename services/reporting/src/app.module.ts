import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { FinancialReportingModule } from './financial/financial-reporting.module.js';
import { 
  configSchemaValidation, 
  databaseConfig, 
  appConfig, 
  authConfig, 
  rabbitMQConfig,
  clientsConfig 
} from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchemaValidation,
      load: [databaseConfig, appConfig, authConfig, rabbitMQConfig, clientsConfig],
    }),
    PrismaModule,
    ClientsModule,
    FinancialReportingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 