/**
 * Shared utility types for the Qbit Accounting System
 */

/**
 * Generic type for configuration options with defaults
 */
export type WithDefaults<T> = {
  [K in keyof T]-?: T[K];
};

/**
 * Type for an object with any string keys and any values
 */
export type AnyRecord = Record<string, any>;

/**
 * Represents a function that has no parameters and returns void
 */
export type VoidFunction = () => void;

/**
 * Represents a function that logs messages
 */
export type LoggerFunction = (message: string, ...meta: any[]) => void; 