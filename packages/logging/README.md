# @qbit/logging

Centralized high-performance logging package for the Qbit Accounting System, built on Pino.

## Features

- High-performance logging with Pino
- Automatic file rotation based on time or size
- Structured JSON logging for better parsing
- HTTP request logging middleware
- Easy integration with NestJS applications
- Context-based logging
- Graceful fallback mechanisms for better reliability
- Flexible transport configuration

## Installation

This package is pre-installed as part of the Qbit Accounting System monorepo.

### Optional Dependencies

For advanced log rotation by time and size, you need to install `pino-roll`:

```bash
# From the monorepo root
yarn workspace @qbit/logging add pino-roll

# Or if in the logging package directory
yarn add pino-roll
```

The package will gracefully fall back to basic file logging if `pino-roll` is not available.

## Usage

```typescript
import { PinoLoggerService, LoggerModule } from '@qbit/logging';

@Injectable()
class AppService {
  constructor(private readonly logger: PinoLoggerService) {
    this.logger.setContext('AppService');
  }

  doSomething() {
    this.logger.log('This is an info message');
    this.logger.error('This is an error message', new Error().stack);
  }
}

// In your module:
@Module({
  imports: [
    LoggerModule.forRoot({
      level: 'info',
      logDir: 'logs',
      fileName: 'app',
      consoleEnabled: true,
      fileEnabled: true,
      frequency: 'daily',
      size: '20m',
    }),
  ],
})
export class AppModule {}
```

## HTTP Request Logging

```typescript
// In your module:
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PinoLoggerMiddleware).forRoutes('*');
  }
}
```

## Logging Levels

| Level   | Description              |
|---------|--------------------------|
| error   | Error conditions         |
| warn    | Warning conditions       |
| info    | Informational messages   |
| debug   | Debug messages           |
| trace   | Extremely detailed traces|

## Module Configuration

### Basic Configuration

```typescript
LoggerModule.forRoot({
  level: 'info',
  logDir: 'logs',
  fileName: 'app',
  consoleEnabled: true,
  fileEnabled: true,
  frequency: 'daily',
  size: '20m',
})
```

### Async Configuration

```typescript
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
  }),
})
```

## Error Handling & Resilience

The @qbit/logging package is designed with resilience in mind:

1. **Graceful Fallbacks**: If advanced file logging fails, the system falls back to simpler alternatives:
   - If `pino-roll` is unavailable, falls back to basic file logging
   - If file logging fails entirely, falls back to console logging
   - If all logging transports fail, falls back to Node's built-in console

2. **Directory Creation**: Automatically creates log directories if they don't exist

3. **Crash Prevention**: Error handling wraps all logging operations to prevent application crashes

## Examples

Check out the [examples](./examples) directory for sample implementations.

## Configuration Options

```typescript
interface PinoLoggerOptions {
  // Minimum log level to record (default: 'info')
  level?: string;
  
  // Directory to store log files (default: 'logs')
  logDir?: string;
  
  // Base name for log files (default: 'app')
  fileName?: string;

  // Whether to output logs to console (default: true)
  consoleEnabled?: boolean;

  // Whether to output logs to files (default: true)
  fileEnabled?: boolean;

  // Log rolling frequency (default: 'daily')
  frequency?: 'hourly' | 'daily' | number;

  // Maximum size of log files (default: '20m')
  size?: string;

  // Whether to create directory if it doesn't exist (default: true)
  mkdir?: boolean;

  // Date format for log files (default: 'yyyy-MM-dd')
  dateFormat?: string;

  // Additional pino options
  pinoOptions?: any;
}
```

## Why Pino?

Pino is chosen for its exceptional performance advantages:

- **Performance**: Pino is significantly faster than other loggers, with benchmarks showing 5x better performance
- **Lower Memory Usage**: Uses less memory, making it better for production environments
- **Structured Logging**: Better JSON-based structured logging for easy parsing by log analysis tools
- **Async by Default**: Non-blocking logging with less impact on application performance

## License

UNLICENSED - Qbit Accounting System proprietary code 