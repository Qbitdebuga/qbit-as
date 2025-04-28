/**
 * Common error-related types and interfaces
 */

/**
 * Interface for standardized error responses
 */
export interface ErrorResponseOptions {
  message: string | null;
  code: string | null;
  details?: Record<string, any>;
  status?: number | null;
}

/**
 * Error source enum for categorizing errors by source
 */
export enum ErrorSource {
  CLIENT = 'CLIENT',
  SERVER = 'SERVER',
  EXTERNAL = 'EXTERNAL',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error severity enum for categorizing errors by severity
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
}

/**
 * Extended error information for internal use and debugging
 */
export interface ErrorMetadata {
  source?: ErrorSource;
  severity?: ErrorSeverity;
  correlationId?: string | null;
  timestamp?: Date;
  component?: string | null;
  service?: string | null;
} 