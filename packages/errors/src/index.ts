// Export exceptions
export * from './exceptions/api.exception';
export * from './exceptions/business.exception';

// Export filters
export * from './filters/global-exception.filter';

// Export interceptors
export * from './interceptors/error-handling.interceptor';

// Export type definitions and helpers
export * from './types.js';

/**
 * @module @qbit/errors
 * 
 * A standardized error handling package for QBit accounting system.
 * 
 * This package provides:
 * - Standardized error classes for API and business logic errors
 * - Global exception filter for NestJS applications
 * - Error handling interceptor for transforming external errors
 * 
 * Usage:
 * 
 * 1. Import the global exception filter in your main.ts:
 * ```
 * import { GlobalExceptionFilter } from '@qbit/errors';
 * 
 * app.useGlobalFilters(new GlobalExceptionFilter());
 * ```
 * 
 * 2. Use the error handling interceptor in your controllers:
 * ```
 * import { ErrorHandlingInterceptor } from '@qbit/errors';
 * 
 * @UseInterceptors(ErrorHandlingInterceptor)
 * @Controller('users')
 * export class UsersController {}
 * ```
 * 
 * 3. Throw standardized exceptions in your services:
 * ```
 * import { ApiException, ErrorCode } from '@qbit/errors';
 * 
 * // In a service method
 * if (!user) {
 *   throw new ApiException(
 *     ErrorCode.RESOURCE_NOT_FOUND,
 *     `User with id ${id} not found`,
 *   );
 * }
 * ```
 */ 