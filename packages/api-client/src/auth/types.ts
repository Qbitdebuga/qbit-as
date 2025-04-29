import { 
  UserDto, 
  CreateUserDto, 
  LoginDto as LoginDtoShared,
  TokenResponseDto,
  RefreshTokenDto,
  ServiceTokenRequestDto,
  ServiceTokenResponseDto,
  ValidateTokenResponseDto
} from '@qbit/shared-types';

/**
 * Auth-related interfaces and types
 */

/**
 * Role names for type safety and autocompletion
 */
export type RoleName = 'admin' | 'user' | 'manager' | 'accountant' | 'support' | string;

/**
 * Enhanced user type with stricter typing
 */
export interface User extends Omit<UserDto, 'roles'> {
  id: string;
  email: string;
  name?: string;
  roles: RoleName[];
}

/**
 * Login request payload 
 */
export interface LoginRequest extends LoginDtoShared {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Refresh token request payload
 */
export type RefreshTokenRequest = RefreshTokenDto;

/**
 * User registration request payload
 */
export interface UserRegistrationRequest extends CreateUserDto {
  email: string;
  password: string;
  name?: string;
  roles?: RoleName[];
}

/**
 * Authentication response with user and tokens
 */
export interface AuthResponse extends TokenResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  csrfToken?: string;
}

/**
 * Token response (without user data)
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Auth status interface returned from auth checks
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
  expiresAt?: number;
}

/**
 * Authentication error codes for more specific error handling
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NO_TOKEN = 'NO_TOKEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  PROFILE_FETCH_FAILED = 'PROFILE_FETCH_FAILED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  USER_FETCH_FAILED = 'USER_FETCH_FAILED',
}

/**
 * Error types for more specific categorization
 */
export type ApiErrorType = 
  | 'auth'
  | 'network'
  | 'validation'
  | 'permission'
  | 'notFound'
  | 'server'
  | 'unknown';

/**
 * Standardized API error interface used for consistent error handling
 */
export interface ApiError {
  status: number;
  message: string;
  code: string | AuthErrorCode;
  type: ApiErrorType;
  data?: unknown;
}

/**
 * Token storage type options
 */
export type TokenStorageType = 'localStorage' | 'cookie' | 'both';

/**
 * Authentication operation context for error handling
 */
export interface AuthOperationContext {
  operation: 'login' | 'logout' | 'register' | 'refreshToken' | 'getProfile' | 'getUsers' | 'getUserById';
  [key: string]: unknown;
} 