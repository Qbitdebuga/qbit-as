import { ConfigService } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonUtilities } from 'nest-winston';
import * as Transport from 'winston-transport';

/**
 * Creates Winston logger configuration with options based on the environment
 * @param configService Config service for accessing environment variables
 * @returns Winston logger configuration options
 */
export const createWinstonLoggerOptions = (
  configService: ConfigService,
): WinstonModuleOptions: any => {
  // Define the console format
  const consoleFormat = winston?.format.combine(
    winston?.format.timestamp(),
    winston?.format.ms(),
    nestWinstonUtilities?.format.nestLike('AUTH', {
      prettyPrint: true,
      colors: true,
    }),
  );

  // Define the JSON format for sending logs to Logstash
  const jsonFormat = winston?.format.combine(
    winston?.format.timestamp(),
    winston?.format.json(),
  );

  // Create an array of transports
  const transports: Transport[] = [
    // Console transport for local development
    new winston?.transports.Console({
      format: consoleFormat,
      level: configService.get('LOG_LEVEL') || 'info',
    }),
  ];

  // Add Logstash HTTP transport if LOGSTASH_URL is defined
  const logstashHost = configService.get('LOGSTASH_HOST') || 'logstash';
  const logstashPort = parseInt(configService.get('LOGSTASH_PORT') || '5000', 10);
  
  // Add HTTP transport for sending logs to Logstash
  transports.push(
    new winston?.transports.Http({
      host: logstashHost,
      port: logstashPort,
      path: '/',
      ssl: false,
      format: jsonFormat,
      level: configService.get('LOG_LEVEL') || 'info',
    }),
  );

  return {
    // Default metadata to include with all logs
    defaultMeta: {
      service: 'auth-service',
      environment: configService.get('NODE_ENV') || 'development',
    },
    // Use the transports defined above
    transports,
    // Handle errors with the logger itself
    handleExceptions: true,
    exitOnError: false,
  };
}; 