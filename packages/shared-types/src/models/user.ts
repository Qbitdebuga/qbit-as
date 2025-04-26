/**
 * User-related models for the QBit system
 */

/**
 * User entity representing a system user
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}

/**
 * User DTO for API responses
 */
export interface UserDto {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  roles?: string[];
}

/**
 * DTO for updating an existing user
 */
export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  roles?: string[];
}

/**
 * Role entity representing user roles in the system
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role DTO for API responses
 */
export interface RoleDto {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

/**
 * DTO for creating a new role
 */
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

/**
 * DTO for updating an existing role
 */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * Auth token response from authentication endpoints
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserDto;
  csrfToken?: string;
} 