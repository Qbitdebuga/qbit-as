import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initTracer, TracingConfig } from '../tracer';

/**
 * Dynamic options for the TracingModule
 */
export interface TracingModuleOptions {
  serviceName: string;
  jaegerEndpoint?: string;
  useJaeger?: boolean;
  otlpEndpoint?: string;
  useOTLP?: boolean;
  environment?: string;
}

@Global()
@Module({})
export class TracingModule implements OnModuleInit {
  /**
   * Register the tracing module with static configuration
   */
  static forRoot(options: TracingModuleOptions): DynamicModule {
    return {
      module: TracingModule,
      providers: [
        {
          provide: 'TRACING_OPTIONS',
          useValue: options,
        },
      ],
      exports: [],
    };
  }

  /**
   * Register the tracing module with async configuration from ConfigService
   */
  static forRootAsync(): DynamicModule {
    return {
      module: TracingModule,
      providers: [
        {
          provide: 'TRACING_OPTIONS',
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TracingModuleOptions => {
            return {
              serviceName: configService.get<string>('SERVICE_NAME') || 'unknown-service',
              jaegerEndpoint: configService.get<string>('JAEGER_ENDPOINT'),
              useJaeger: configService.get<boolean>('USE_JAEGER') || true,
              otlpEndpoint: configService.get<string>('OTLP_ENDPOINT'),
              useOTLP: configService.get<boolean>('USE_OTLP') || false,
              environment: configService.get<string>('NODE_ENV') || 'development',
            };
          },
        },
      ],
      exports: [],
    };
  }

  constructor(private readonly options: TracingModuleOptions) {}

  onModuleInit() {
    // Initialize the tracer when the module is initialized
    initTracer({
      serviceName: this.options.serviceName,
      jaegerEndpoint: this.options.jaegerEndpoint,
      useJaeger: this.options.useJaeger,
      otlpEndpoint: this.options.otlpEndpoint,
      useOTLP: this.options.useOTLP,
      environment: this.options.environment,
    });
  }
} 