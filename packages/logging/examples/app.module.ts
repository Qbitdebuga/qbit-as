import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, PinoLoggerMiddleware } from '@qbit/logging';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Pino logger module configuration
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get<string>('LOG_LEVEL', 'info'),
        logDir: configService.get<string>('LOG_DIR', 'logs'),
        fileName: configService.get<string>('SERVICE_NAME', 'app'),
        consoleEnabled: configService.get<string>('NODE_ENV', 'development') !== 'production',
        fileEnabled: true,
        frequency: 'daily',
        size: '50m',
        dateFormat: 'yyyy-MM-dd',
        pinoOptions: {
          // Add service name to every log
          base: {
            service: configService.get<string>('SERVICE_NAME', 'app'),
            environment: configService.get<string>('NODE_ENV', 'development')
          },
        }
      }),
    }),
    
    // Other modules would be imported here
    // UsersModule,
    // AuthModule,
    // etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Pino logger middleware to all routes
    consumer.apply(PinoLoggerMiddleware).forRoutes('*');
  }
} 