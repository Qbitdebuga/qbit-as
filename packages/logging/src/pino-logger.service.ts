import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import pino from 'pino';
import { join } from 'path';
// Import from local types for now
// import { LoggerConfigOptions, LogLevel } from '@qbit/shared-types';

// Type definitions for pino-roll
interface PinoRollOptions {
  file: string;
  frequency?: 'hourly' | 'daily' | number;
  size?: string;
  mkdir?: boolean;
  dateFormat?: string;
  extension?: string;
}

export interface PinoLoggerOptions {
  /**
   * Minimum log level to record
   * @default 'info'
   */
  level?: string;
  
  /**
   * Directory to store log files
   * @default 'logs'
   */
  logDir?: string;
  
  /**
   * Base name for log files
   * @default 'app'
   */
  fileName?: string;

  /**
   * Whether to output logs to console
   * @default true
   */
  consoleEnabled?: boolean;

  /**
   * Whether to output logs to files
   * @default true
   */
  fileEnabled?: boolean;

  /**
   * Log rolling frequency
   * @default 'daily'
   */
  frequency?: 'hourly' | 'daily' | number;

  /**
   * Maximum size of log files
   * @default '20m'
   */
  size?: string;

  /**
   * Whether to create directory if it doesn't exist
   * @default true
   */
  mkdir?: boolean;

  /**
   * Date format for log files
   * @default 'yyyy-MM-dd'
   */
  dateFormat?: string;

  /**
   * Additional pino options
   */
  pinoOptions?: any;
}

/**
 * Centralized logger service built on Pino for Qbit Accounting System
 * Provides better performance than Winston for high-volume logging
 */
@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService implements NestLoggerService {
  private logger: any;
  private context?: string;
  
  constructor(options?: PinoLoggerOptions) {
    const {
      level = 'info',
      logDir = 'logs',
      fileName = 'app',
      consoleEnabled = true,
      fileEnabled = true,
      frequency = 'daily',
      size = '20m',
      mkdir = true,
      dateFormat = 'yyyy-MM-dd',
      pinoOptions = {}
    } = options || {};

    try {
      // Configure targets based on enabled outputs
      const targets: any[] = [];

      // Add console transport if enabled
      if (consoleEnabled) {
        targets.push({
          target: 'pino/file',
          options: { destination: 1 } // stdout
        });
      }

      // Add file transport if enabled
      if (fileEnabled) {
        try {
          // Check if pino-roll is available
          require.resolve('pino-roll');
          
          targets.push({
            target: 'pino-roll',
            options: {
              file: join(logDir, fileName),
              frequency,
              size,
              mkdir,
              dateFormat,
              extension: '.log'
            } as PinoRollOptions
          });
        } catch (error) {
          // Fallback to simple file transport if pino-roll is not available
          console.warn('pino-roll transport not available, falling back to basic file transport. To enable advanced file rotation, install pino-roll: yarn add pino-roll');
          
          try {
            // Ensure the log directory exists
            const fs = require('fs');
            if (!fs.existsSync(logDir) && mkdir) {
              fs.mkdirSync(logDir, { recursive: true });
            }
            
            targets.push({
              target: 'pino/file',
              options: {
                destination: join(logDir, `${fileName}.log`),
                mkdir
              }
            });
          } catch (fsError) {
            console.error('Failed to setup file logging:', fsError);
            // Continue with console only if file setup fails
          }
        }
      }

      // Create the logger with transports
      const transport = {
        targets
      };

      this.logger = pino({
        level,
        transport,
        ...pinoOptions
      });
    } catch (err) {
      // Fallback to basic console logger if transport setup fails
      console.error('Failed to initialize Pino logger with transports:', err);
      console.warn('Falling back to basic Pino logger with console output only');
      
      this.logger = pino({
        level,
        ...pinoOptions
      });
    }
  }

  /**
   * Set the context for the logger
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Log a debug message
   */
  debug(message: any, ...optionalParams: any[]): void {
    this.logWithLevel('debug', message, optionalParams);
  }

  /**
   * Log an info message
   */
  log(message: any, ...optionalParams: any[]): void {
    this.logWithLevel('info', message, optionalParams);
  }

  /**
   * Log a warning message
   */
  warn(message: any, ...optionalParams: any[]): void {
    this.logWithLevel('warn', message, optionalParams);
  }

  /**
   * Log an error message
   */
  error(message: any, trace?: string, ...optionalParams: any[]): void {
    const params = trace ? [...optionalParams, { trace }] : optionalParams;
    this.logWithLevel('error', message, params);
  }

  /**
   * Log a verbose message
   */
  verbose(message: any, ...optionalParams: any[]): void {
    // Pino doesn't have a verbose level, map to debug
    this.logWithLevel('debug', message, optionalParams);
  }

  /**
   * Internal method for logging with a specific level
   */
  private logWithLevel(level: string, message: any, optionalParams: any[] = []): void {
    try {
      const meta = optionalParams.reduce((acc, item) => {
        if (item && typeof item === 'object') {
          return { ...acc, ...item };
        }
        return acc;
      }, {});

      const logObject = {
        ...(this.context ? { context: this.context } : {}),
        ...meta
      };

      if (typeof message === 'object') {
        this.logger[level]({ ...logObject, ...message });
      } else {
        this.logger[level](logObject, message);
      }
    } catch (err) {
      // Fallback to console if logging fails
      console[level === 'debug' || level === 'verbose' ? 'debug' : 
               level === 'info' || level === 'log' ? 'log' : 
               level === 'warn' ? 'warn' : 'error'](
        this.context ? `[${this.context}] ` : '',
        message,
        ...optionalParams
      );
    }
  }
} 