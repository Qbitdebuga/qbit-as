/**
 * Auth Service Interfaces
 * Define the contracts for Auth Service communication
 */

export interface UserDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roles?: string[];
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ServiceTokenRequestDto {
  serviceId: string;
  serviceName: string;
  scopes: string[];
}

export interface ServiceTokenResponseDto {
  accessToken: string;
  expiresIn: number;
}

export interface ValidateTokenResponseDto {
  valid: boolean;
  userId?: string;
  roles?: string[];
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * Auth Service Interface - defines the methods available on the Auth Service
 */
export interface IAuthService {
  // User management
  getUsers(): Promise<UserDto[]>;
  getUserById(userId: string): Promise<UserDto>;
  createUser(createUserDto: CreateUserDto): Promise<UserDto>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto>;
  deleteUser(userId: string): Promise<void>;
  
  // Authentication
  login(loginDto: LoginDto): Promise<TokenResponseDto>;
  refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto>;
  validateToken(token: string): Promise<ValidateTokenResponseDto>;
  
  // Service authentication
  getServiceToken(serviceTokenRequestDto: ServiceTokenRequestDto): Promise<ServiceTokenResponseDto>;
  
  // Role management
  getRoles(): Promise<RoleDto[]>;
  getRoleById(roleId: string): Promise<RoleDto>;
  createRole(createRoleDto: CreateRoleDto): Promise<RoleDto>;
  updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<void>;
  
  // User-role management
  assignRoleToUser(userId: string, roleId: string): Promise<void>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
  checkUserRoles(userId: string, requiredRoles: string[]): Promise<boolean>;
} 