import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';

@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Import application config module
    AppConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 