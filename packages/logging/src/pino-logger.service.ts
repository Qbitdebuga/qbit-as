import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import pino from 'pino';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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
   * @default false in ESM context
   */
  fileEnabled?: boolean;

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
      fileEnabled = false, // Default to false in ESM context
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

      // Add file transport if enabled - but warn about ESM compatibility
      if (fileEnabled) {
        console.warn('WARNING: File-based logging with rotation is not fully compatible with ESM. Consider using Docker or PM2 for log rotation instead.');
        try {
          // Simple approach - just write to a file without rotation
          // Ensure the log directory exists
          if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
          }
          
          targets.push({
            target: 'pino/file',
            options: {
              destination: join(logDir, `${fileName}.log`)
            }
          });
        } catch (fsError) {
          console.error('Failed to setup file logging:', fsError);
          // Continue with console only if file setup fails
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
    const params = trace ? [trace, ...optionalParams] : optionalParams;
    this.logWithLevel('error', message, params);
  }

  /**
   * Log a verbose message
   */
  verbose(message: any, ...optionalParams: any[]): void {
    this.logWithLevel('debug', message, optionalParams);
  }

  /**
   * Internal method to log with a specific level
   */
  private logWithLevel(level: string, message: any, optionalParams: any[] = []): void {
    const logObject: any = {};
    
    // Add context if available
    if (this.context) {
      logObject.context = this.context;
    }
    
    // Handle different message types
    if (typeof message === 'object' && message !== null) {
      // If message is an error, format it specially
      if (message instanceof Error) {
        logObject.error = {
          message: message.message,
          name: message.name,
          stack: message.stack,
        };
        // If trace is provided as the first optional param, add it
        if (optionalParams.length > 0 && typeof optionalParams[0] === 'string') {
          logObject.trace = optionalParams[0];
          optionalParams = optionalParams.slice(1);
        }
      } else {
        // For other objects, merge them into the log object
        Object.assign(logObject, message);
      }
    } else {
      // For string/primitive messages, use the msg field
      logObject.msg = message;
    }
    
    // Add optional params if present
    if (optionalParams.length > 0) {
      logObject.additional = optionalParams;
    }
    
    // Log with the appropriate level
    this.logger[level](logObject);
  }
} 