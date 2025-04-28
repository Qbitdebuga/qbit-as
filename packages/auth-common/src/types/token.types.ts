/**
 * Interface representing the payload of a JWT token
 */
export interface TokenPayload {
  sub: string | null;        // Subject (typically user ID)
  username: string | null;   // Username
  email: string | null;       // Email
  roles: string[];     // User roles
  permissions?: string[]; // User permissions
  iat?: number | null;       // Issued at
  exp?: number | null;       // Expiration time
  iss?: string | null;       // Issuer
  [key: string]: any; // For any additional custom claims
}

/**
 * Interface representing a JWT payload, compatible with the jsonwebtoken library
 */
export interface JwtPayload {
  sub: string | null;
  [key: string]: any;
}

/**
 * Interface representing the current authenticated user
 */
export interface CurrentUser {
  id: string | null;
  username: string | null;
  email: string | null;
  roles: string[];
  permissions?: string[];
} 