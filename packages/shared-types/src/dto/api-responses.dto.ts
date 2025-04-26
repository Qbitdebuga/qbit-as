/**
 * Standard API response DTOs
 */

/**
 * Base API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

/**
 * API error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only included in development environment
}

/**
 * API response metadata for pagination, etc.
 */
export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  timestamp?: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic success response
 */
export type SuccessResponse<T> = ApiResponse<T> & { success: true; data: T };

/**
 * Generic error response
 */
export type ErrorResponse = ApiResponse & { success: false; error: ApiError };

/**
 * Paginated response with items and metadata
 */
export interface PaginatedResponse<T> extends ApiResponse {
  success: true;
  data: T[];
  meta: Required<Pick<ApiResponseMeta, 'page' | 'limit' | 'totalItems' | 'totalPages'>>;
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, meta?: ApiResponseMeta): SuccessResponse<T> {
  return {
    success: true,
    data,
    meta
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(code: string, message: string, details?: Record<string, any>): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages
    }
  };
} 