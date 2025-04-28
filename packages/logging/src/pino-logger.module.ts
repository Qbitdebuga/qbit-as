import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';
import { PinoLoggerEventsService } from './pino-logger-events.service';

/**
 * Configuration options for the PinoLoggerModule
 */
export interface PinoLoggerModuleOptions {
  /**
   * Logger options for configuring the PinoLoggerService
   */
  loggerOptions?: any;
  
  /**
   * Service name for identifying the source in centralized logging
   */
  serviceName?: string;
  
  /**
   * Whether to enable the event-based integration
   * @default false
   */
  enableEvents?: boolean;
}

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
  static forRoot(options: PinoLoggerModuleOptions = {}): DynamicModule {
    const { loggerOptions, serviceName, enableEvents = false } = options;
    
    const providers: Provider[] = [
      {
        provide: PinoLoggerService,
        useFactory: () => {
          return new PinoLoggerService(loggerOptions);
        },
      },
    ];
    
    // Add events service if enabled
    if (enableEvents) {
      providers.push({
        provide: PinoLoggerEventsService,
        useFactory: (logger: PinoLoggerService) => {
          const eventsService = new PinoLoggerEventsService(logger);
          if (serviceName) {
            eventsService.setServiceName(serviceName);
          }
          return eventsService;
        },
        inject: [PinoLoggerService],
      });
    }

    return {
      module: LoggerModule,
      providers,
      exports: [
        PinoLoggerService,
        ...(enableEvents ? [PinoLoggerEventsService] : []),
      ],
      global: true,
    };
  }

  /**
   * Register the Pino logger module asynchronously
   */
  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => PinoLoggerModuleOptions | Promise<PinoLoggerModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    const loggerProvider: Provider = {
      provide: PinoLoggerService,
      useFactory: async (...args: any[]) => {
        const { loggerOptions } = await options.useFactory(...args) || {};
        return new PinoLoggerService(loggerOptions);
      },
      inject: options.inject || [],
    };
    
    const eventsProvider: Provider = {
      provide: PinoLoggerEventsService,
      useFactory: async (logger: PinoLoggerService, ...args: any[]) => {
        const { serviceName, enableEvents = false } = await options.useFactory(...args) || {};
        
        if (!enableEvents) {
          return null;
        }
        
        const eventsService = new PinoLoggerEventsService(logger);
        if (serviceName) {
          eventsService.setServiceName(serviceName);
        }
        return eventsService;
      },
      inject: [PinoLoggerService, ...(options.inject || [])],
    };

    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [loggerProvider, eventsProvider],
      exports: [PinoLoggerService, PinoLoggerEventsService],
      global: true,
    };
  }
} 