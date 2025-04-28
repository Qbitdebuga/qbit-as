/**
 * Logging-related event types and interfaces
 */
import { LogLevel } from './index';

/**
 * Base event structure for logging events
 */
export interface LoggingEventBase {
  /**
   * Service that originated the event
   */
  serviceSource: string;
  
  /**
   * Timestamp when the event was created
   */
  timestamp: string;
}

/**
 * Event sent when a log level change is requested
 */
export interface LogLevelChangeEvent extends LoggingEventBase {
  /**
   * The new log level
   */
  newLevel: LogLevel;
  
  /**
   * Optional: Specific services to apply this log level to
   * If undefined, applies to all services
   */
  targetServices?: string[];
  
  /**
   * Optional: Duration in milliseconds for this log level change
   * After this duration, the service will revert to its default log level
   * If undefined, the change is permanent until another change is made
   */
  durationMs?: number;
}

/**
 * Event patterns/names used in the system
 */
export enum LoggingEventPatterns {
  LOG_LEVEL_CHANGE = 'logging.level.change',
  LOG_ENTRY = 'logging.entry',
  LOG_CONFIG_REQUEST = 'logging.config.request',
  LOG_CONFIG_RESPONSE = 'logging.config.response'
} 