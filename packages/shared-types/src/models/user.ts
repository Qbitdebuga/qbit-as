/**
 * User-related models for the QBit system
 */

/**
 * User entity representing a system user
 */
export interface User {
  id: string | null;
  email: string | null;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}

/**
 * User DTO for API responses
 */
export interface UserDto {
  id: string | null;
  email: string | null;
  name?: string | null;
  roles: string[];
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  email: string | null;
  password: string | null;
  name?: string | null;
  roles?: string[];
}

/**
 * DTO for updating an existing user
 */
export interface UpdateUserDto {
  email?: string | null;
  password?: string | null;
  name?: string | null;
  roles?: string[];
}

/**
 * Role entity representing user roles in the system
 */
export interface Role {
  id: string | null;
  name: string | null;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role DTO for API responses
 */
export interface RoleDto {
  id: string | null;
  name: string | null;
  description: string | null;
  permissions: string[];
}

/**
 * DTO for creating a new role
 */
export interface CreateRoleDto {
  name: string | null;
  description?: string | null;
  permissions?: string[];
}

/**
 * DTO for updating an existing role
 */
export interface UpdateRoleDto {
  name?: string | null;
  description?: string | null;
  permissions?: string[];
}

/**
 * Auth token response from authentication endpoints
 */
export interface AuthTokenResponse {
  accessToken: string | null;
  refreshToken?: string | null;
  expiresIn: number | null;
  user: UserDto;
  csrfToken?: string | null;
} 