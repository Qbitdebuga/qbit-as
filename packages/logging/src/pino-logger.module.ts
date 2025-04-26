import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';
import { PinoLoggerOptions } from './pino-logger.service';

@Module({})
export class LoggerModule {
  /**
   * Register the logger module with default settings
   */
  static register(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [PinoLoggerService],
      exports: [PinoLoggerService],
    };
  }

  /**
   * Register the Pino logger module with custom settings
   */
  static forRoot(options: PinoLoggerOptions): DynamicModule {
    const loggerProvider: Provider = {
      provide: PinoLoggerService,
      useFactory: () => {
        return new PinoLoggerService(options);
      },
    };

    return {
      module: LoggerModule,
      providers: [loggerProvider],
      exports: [PinoLoggerService],
      global: true,
    };
  }

  /**
   * Register the Pino logger module asynchronously
   */
  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => PinoLoggerOptions | Promise<PinoLoggerOptions>;
    inject?: any[];
  }): DynamicModule {
    const loggerProvider: Provider = {
      provide: PinoLoggerService,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return new PinoLoggerService(config);
      },
      inject: options.inject || [],
    };

    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [loggerProvider],
      exports: [PinoLoggerService],
      global: true,
    };
  }
} 