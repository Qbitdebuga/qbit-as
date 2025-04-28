import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException, ErrorCode } from '../exceptions/api.exception';
import { BusinessException } from '../exceptions/business.exception';
import { createErrorResponse } from '@qbit/shared-types';

/**
 * Global exception filter that converts all exceptions into standardized API responses
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Catches all exceptions and formats them into standardized responses
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    this.logException(exception, request);
    
    // Handle different types of exceptions
    if (exception instanceof ApiException || exception instanceof BusinessException) {
      // For our custom ApiExceptions, the response is already properly formatted
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    
    if (exception instanceof HttpException) {
      // For NestJS HttpExceptions, standardize the response format
      const status = exception.getStatus();
      const errorResponse = this.formatHttpException(exception, status);
      response.status(status).json(errorResponse);
      return;
    }
    
    // For all other exceptions, create a generic internal server error response
    const errorResponse = createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      this.isDevelopment() ? { stack: this.getStack(exception) } : undefined,
    );
    
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  /**
   * Format HttpException into standardized error response
   */
  private formatHttpException(exception: HttpException, status: number) {
    const response = exception.getResponse();
    let message = 'An error occurred';
    let details: Record<string, any> | undefined;
    
    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object' && response !== null) {
      // Handle NestJS validation exceptions
      if ('message' in response) {
        if (Array.isArray(response.message)) {
          message = 'Validation failed';
          details = { validationErrors: response.message };
        } else if (typeof response.message === 'string') {
          message = response.message;
        }
      }
    }
    
    let errorCode: string | null;
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        errorCode = ErrorCode.INVALID_INPUT;
        break;
      case HttpStatus.UNAUTHORIZED:
        errorCode = ErrorCode.UNAUTHORIZED;
        break;
      case HttpStatus.FORBIDDEN:
        errorCode = ErrorCode.FORBIDDEN;
        break;
      case HttpStatus.NOT_FOUND:
        errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        break;
      case HttpStatus.CONFLICT:
        errorCode = ErrorCode.RESOURCE_CONFLICT;
        break;
      case HttpStatus.TOO_MANY_REQUESTS:
        errorCode = ErrorCode.TOO_MANY_REQUESTS;
        break;
      default:
        errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    }
    
    return createErrorResponse(errorCode, message, details);
  }

  /**
   * Log the exception with appropriate level based on status code
   */
  private logException(exception: unknown, request: Request): void {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }
    
    const method = request.method;
    const url = request.originalUrl || request.url;
    const message = `${method} ${url} - ${this.getExceptionMessage(exception)}`;
    
    // Log with appropriate level based on status code
    if (status >= 500) {
      this?.logger.error(message);
      this?.logger.error(this.getStack(exception));
    } else if (status >= 400) {
      this?.logger.warn(message);
    } else {
      this?.logger.log(message);
    }
  }

  /**
   * Extract a message from the exception
   */
  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return String(exception);
  }

  /**
   * Extract stack trace from the exception
   */
  private getStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    
    return undefined;
  }

  /**
   * Check if running in development environment
   */
  private isDevelopment(): boolean {
    return process?.env.NODE_ENV !== 'production';
  }
} 