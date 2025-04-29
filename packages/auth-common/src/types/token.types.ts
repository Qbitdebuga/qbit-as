/**
 * Interface representing the payload of a JWT token
 */
export interface TokenPayload {
  sub: string;        // Subject (typically user ID)
  username: string;   // Username
  email: string;       // Email
  roles: string[];     // User roles
  permissions?: string[]; // User permissions
  iat?: number;       // Issued at
  exp?: number;       // Expiration time
  iss?: string;       // Issuer
  [key: string]: string | string[] | number | undefined; // For any additional custom claims with specific types
}

/**
 * Interface representing a JWT payload, compatible with the jsonwebtoken library
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  type?: string;
  [key: string]: string | string[] | number | undefined;
}

/**
 * Interface representing the current authenticated user
 */
export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions?: string[];
} 