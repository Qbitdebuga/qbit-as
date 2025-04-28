/**
 * Error interfaces
 * This file contains interfaces for standardized error handling across the application
 */

/**
 * Standard API error response structure
 */
export interface ApiError {
  /** Error code identifying the type of error */
  code: string;
  
  /** User-friendly error message */
  message: string;
  
  /** Optional details about the error (e.g., validation errors) */
  details?: Record<string, any>;
}

/**
 * Standard API response with error
 */
export interface ErrorResponse {
  /** Success flag (always false for errors) */
  success: false;
  
  /** Error details */
  error: ApiError;
}

/**
 * Helper function to create a standardized error response
 */
export const createErrorResponse = (
  code: string, 
  message: string, 
  details?: Record<string, any>
): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details
  }
}); 