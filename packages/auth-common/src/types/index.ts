/**
 * Type exports
 * 
 * This file will export all types related to authentication and authorization.
 */

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string | null;
  username: string | null;
  roles?: string[];
  [key: string]: any;
}

/**
 * User information extracted from JWT
 */
export interface CurrentUser {
  id: string | null;
  username: string | null;
  roles: string[];
  [key: string]: any;
} 