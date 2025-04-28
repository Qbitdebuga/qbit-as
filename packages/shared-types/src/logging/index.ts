/**
 * Shared logging types for the Qbit Accounting System
 */

// Export events
export * from './events';

/**
 * Supported log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Configuration options for the logger
 */
export interface LoggerConfigOptions {
  /**
   * Minimum log level to record
   * @default 'info'
   */
  level?: LogLevel;
  
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
}

/**
 * Log entry structure
 */
export interface LogEntry {
  /**
   * Log level
   */
  level: LogLevel;
  
  /**
   * Log message
   */
  message: string;
  
  /**
   * Timestamp in ISO format
   */
  timestamp: string;
  
  /**
   * Optional context (e.g., class or module name)
   */
  context?: string;
  
  /**
   * Optional trace ID for distributed tracing
   */
  traceId?: string;
  
  /**
   * Optional additional metadata
   */
  [key: string]: any;
} 