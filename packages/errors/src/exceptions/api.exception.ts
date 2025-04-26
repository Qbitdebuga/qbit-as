import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiError } from '@qbit/shared-types';

/**
 * ErrorCode enum for categorizing application errors
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Business logic errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}

/**
 * A standardized API exception that can be thrown throughout the application
 */
export class ApiException extends HttpException {
  /**
   * Create a new API exception
   * @param errorCode Error code from ErrorCode enum
   * @param message User-friendly error message
   * @param details Additional details about the error
   * @param status HTTP status code
   */
  constructor(
    public readonly errorCode: ErrorCode | string,
    public readonly message: string,
    public readonly details?: Record<string, any>,
    status?: HttpStatus,
  ) {
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          details,
        } as ApiError,
      },
      status || ApiException.getStatusCodeFromErrorCode(errorCode),
    );
  }

  /**
   * Map error code to HTTP status code
   */
  private static getStatusCodeFromErrorCode(errorCode: ErrorCode | string): HttpStatus {
    switch (errorCode) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.TOKEN_EXPIRED:
      case ErrorCode.INVALID_TOKEN:
        return HttpStatus.UNAUTHORIZED;
        
      case ErrorCode.FORBIDDEN:
      case ErrorCode.INSUFFICIENT_PERMISSIONS:
        return HttpStatus.FORBIDDEN;
        
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.INVALID_INPUT:
        return HttpStatus.BAD_REQUEST;
        
      case ErrorCode.RESOURCE_NOT_FOUND:
        return HttpStatus.NOT_FOUND;
        
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
      case ErrorCode.RESOURCE_CONFLICT:
        return HttpStatus.CONFLICT;
        
      case ErrorCode.TOO_MANY_REQUESTS:
        return HttpStatus.TOO_MANY_REQUESTS;
        
      case ErrorCode.SERVICE_UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;
        
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
} 