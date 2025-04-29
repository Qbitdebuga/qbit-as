import { ApiError, ApiErrorType, AuthErrorCode, AuthOperationContext } from '@qbit/api-client/src/auth/types';

/**
 * Standard error details format for consistent error handling
 */
export interface ErrorDetails {
  message: string;
  type: ErrorType;
  code: string;
  context?: Record<string, unknown>;
  original?: unknown;
}

/**
 * Error types to categorize errors
 */
export type ErrorType = ApiErrorType;

/**
 * Error log level
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
  code: string;
  type: ErrorType;
  
  constructor(message: string, code = 'AUTH_ERROR', type: ErrorType = 'auth') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.type = type;
  }
}

/**
 * Custom error class for network-related errors
 */
export class NetworkError extends Error {
  code: string;
  type: ErrorType;
  
  constructor(message: string, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
    this.type = 'network';
  }
}

/**
 * Custom error class for validation-related errors
 */
export class ValidationError extends Error {
  code: string;
  type: ErrorType;
  details?: Record<string, unknown>;
  
  constructor(message: string, details?: Record<string, unknown>, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.type = 'validation';
    this.details = details;
  }
}

/**
 * Options for error handling
 */
interface ErrorHandlerOptions {
  defaultMessage?: string;
  context?: AuthOperationContext;
  logLevel?: LogLevel;
}

/**
 * Centralized error handler for consistent error processing
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlerOptions = {}
): ErrorDetails {
  const defaultMessage = options.defaultMessage || 'An unexpected error occurred';
  
  // If it's already an ApiError, use it directly
  if (error && typeof error === 'object' && 'type' in error && 'message' in error && 'code' in error) {
    const apiError = error as ApiError;
    return {
      message: apiError.message,
      type: apiError.type,
      code: apiError.code.toString(),
      context: options.context,
      original: apiError
    };
  }
  
  // If it's an AuthError instance
  if (error instanceof AuthError) {
    return {
      message: error.message,
      type: error.type,
      code: error.code,
      context: options.context,
      original: error
    };
  }
  
  // Standard error instance
  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      type: 'unknown',
      code: 'UNKNOWN_ERROR',
      context: options.context,
      original: error
    };
  }
  
  // Error is an HTTP response object
  if (error && typeof error === 'object' && 'status' in error) {
    const responseError = error as { status: number; statusText?: string };
    
    // Determine error type based on status code
    let type: ErrorType = 'unknown';
    let code = 'SERVER_ERROR';
    
    if (responseError.status === 401) {
      type = 'auth';
      code = AuthErrorCode.INVALID_TOKEN;
    } else if (responseError.status === 403) {
      type = 'permission';
      code = AuthErrorCode.INSUFFICIENT_PERMISSIONS;
    } else if (responseError.status === 400) {
      type = 'validation';
      code = 'VALIDATION_ERROR';
    } else if (responseError.status === 404) {
      type = 'notFound';
      code = 'NOT_FOUND';
    } else if (responseError.status >= 500) {
      type = 'server';
      code = 'SERVER_ERROR';
    }
    
    return {
      message: responseError.statusText || `HTTP Error ${responseError.status}`,
      type,
      code,
      context: options.context,
      original: error
    };
  }
  
  // Other error types (string, etc.)
  return {
    message: error ? String(error) : defaultMessage,
    type: 'unknown',
    code: 'UNKNOWN_ERROR',
    context: options.context,
    original: error
  };
}

/**
 * Format an error message for display to the user
 */
export function formatErrorMessage(error: ErrorDetails): string {
  // If it's an auth error, provide more specific messages
  if (error.type === 'auth') {
    if (error.code === AuthErrorCode.INVALID_CREDENTIALS) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.code === AuthErrorCode.ACCOUNT_LOCKED) {
      return 'Your account has been locked. Please contact support.';
    }
    if (error.code === AuthErrorCode.EMAIL_NOT_VERIFIED) {
      return 'Please verify your email address before logging in.';
    }
    if (error.code === AuthErrorCode.TOKEN_EXPIRED) {
      return 'Your session has expired. Please log in again.';
    }
    return 'Authentication error. Please log in again.';
  }
  
  // Network errors
  if (error.type === 'network') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Validation errors
  if (error.type === 'validation') {
    return error.message || 'Please check your input and try again.';
  }
  
  // Permission errors
  if (error.type === 'permission') {
    return 'You do not have permission to perform this action.';
  }
  
  // Not found errors
  if (error.type === 'notFound') {
    return 'The requested resource was not found.';
  }
  
  // Server errors
  if (error.type === 'server') {
    return 'A server error occurred. Please try again later.';
  }
  
  // Fall back to the original message or a generic one
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Log error details to the console or monitoring service
 */
export function logError(error: ErrorDetails, level: LogLevel = 'error'): void {
  const { type, code, message, context, original } = error;
  
  // Format log data - omit large objects for cleaner logs
  const logData = {
    type,
    code,
    ...(context && Object.keys(context).length < 10 ? { context } : { context: 'Large context object omitted' }),
    ...(process.env.NODE_ENV !== 'production' ? { original } : {})
  };
  
  // Log with appropriate level
  switch (level) {
    case 'error':
      console.error(`[ERROR][${type}][${code}] ${message}`, logData);
      break;
    case 'warn':
      console.warn(`[WARN][${type}][${code}] ${message}`, logData);
      break;
    case 'info':
      console.info(`[INFO][${type}][${code}] ${message}`, logData);
      break;
    case 'debug':
      console.debug(`[DEBUG][${type}][${code}] ${message}`, logData);
      break;
  }
} 