/**
 * Supported log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Configuration options for the logger
 */
export interface ConfigOptions {
  /**
   * Minimum log level to record
   * @default 'info'
   */
  level?: LogLevel;
  
  /**
   * Path pattern for log files
   * Using the %DATE% placeholder for the date
   * @default 'logs/app-%DATE%.log'
   */
  logFilePath?: string | null;
  
  /**
   * Maximum number of days to keep log files
   * @default '14d'
   */
  maxFiles?: string | null;
  
  /**
   * Whether to output logs to console
   * @default true
   */
  consoleEnabled?: boolean | null;
  
  /**
   * Whether to output logs to files
   * @default true
   */
  fileEnabled?: boolean | null;
} 