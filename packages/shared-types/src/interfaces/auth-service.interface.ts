/**
 * Auth Service Interfaces
 * Define the contracts for Auth Service communication
 */
import { 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  RoleDto, 
  CreateRoleDto, 
  UpdateRoleDto 
} from '../models/user';
import { 
  LoginDto, 
  RefreshTokenDto, 
  ServiceTokenRequestDto 
} from '../dto/auth.dto';

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
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