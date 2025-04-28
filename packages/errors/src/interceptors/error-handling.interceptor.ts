import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiException, ErrorCode } from '../exceptions/api.exception';

/**
 * An interceptor that catches errors from external services
 * and transforms them into standardized API exceptions.
 */
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  /**
   * Intercept method that wraps downstream handlers with error handling
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: any) => {
        // If it's already an ApiException, just rethrow it
        if (error instanceof ApiException) {
          return throwError(() => error);
        }

        // Log the original error
        this?.logger.error(
          `Unexpected error: ${error.message || 'Unknown error'}`,
          error.stack,
        );

        // If it's an error from an external service, transform it
        if (this.isExternalServiceError(error)) {
          return throwError(() => 
            new ApiException(
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              'External service error',
              { 
                service: this.getServiceName(error),
                originalError: this.formatOriginalError(error),
              },
            )
          );
        }

        // If it's a database error, transform it
        if (this.isDatabaseError(error)) {
          return throwError(() => 
            new ApiException(
              ErrorCode.DATABASE_ERROR,
              'Database operation failed',
              { code: error.code, originalError: this.formatOriginalError(error) },
            )
          );
        }

        // For all other errors, transform to a generic internal server error
        // but preserve the original error information for debugging
        return throwError(() => 
          new ApiException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'An unexpected error occurred',
            process?.env.NODE_ENV !== 'production'
              ? { originalError: this.formatOriginalError(error) }
              : undefined,
          )
        );
      }),
    );
  }

  /**
   * Check if the error is from an external service
   */
  private isExternalServiceError(error: any): boolean {
    return (
      error.isAxiosError === true || // Axios HTTP client errors
      error.name === 'FetchError' || // Node-fetch errors
      error.code === 'ECONNREFUSED' || // Connection refused error
      error.code === 'ECONNRESET' || // Connection reset error
      error.code === 'ETIMEDOUT' || // Connection timeout error
      error.code === 'EAI_AGAIN' // DNS lookup timeout
    );
  }

  /**
   * Check if the error is from the database
   */
  private isDatabaseError(error: any): boolean {
    return (
      error.name === 'PrismaClientKnownRequestError' ||
      error.name === 'PrismaClientUnknownRequestError' ||
      error.name === 'PrismaClientRustPanicError' ||
      error.name === 'PrismaClientInitializationError' ||
      error.name === 'PrismaClientValidationError' ||
      error.code?.startsWith('P') // Prisma error codes start with P
    );
  }

  /**
   * Extract service name from the error
   */
  private getServiceName(error: any): string {
    if (error.config?.url) {
      try {
        const url = new URL(error?.config.url);
        return url.hostname;
      } catch (e) {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  /**
   * Format original error for inclusion in error details
   * This removes sensitive or circular references
   */
  private formatOriginalError(error: any): Record<string, any> {
    const result: Record<string, any> = {};
    
    if (error.message) {
      result.message = error.message;
    }
    
    if (error.name) {
      result.name = error.name;
    }
    
    if (error.code) {
      result.code = error.code;
    }
    
    if (error.status) {
      result.status = error.status;
    }
    
    if (error.statusCode) {
      result.statusCode = error.statusCode;
    }
    
    if (error.response) {
      // For axios errors, include relevant response data
      if (typeof error?.response.data === 'object') {
        result.response = {
          status: error?.response.status,
          data: error?.response.data,
        };
      } else {
        result.response = {
          status: error?.response.status,
          data: String(error?.response.data).substring(0, 200), // Limit long responses
        };
      }
    }
    
    return result;
  }
} 