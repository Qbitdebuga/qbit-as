/**
 * Authentication related DTOs
 */
import { UserDto } from '../models/user';

/**
 * Login request DTO
 */
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration request DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

/**
 * Email verification request DTO
 */
export interface VerifyEmailDto {
  token: string;
}

/**
 * Password reset request DTO
 */
export interface RequestPasswordResetDto {
  email: string;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDto {
  token: string;
  password: string;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * Service-to-service authentication token request
 */
export interface ServiceTokenRequestDto {
  serviceId: string;
  serviceName: string;
  apiKey?: string;
  scopes?: string[];
  expiresIn?: number;
}

/**
 * Auth response with tokens and user information
 */
export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  csrfToken?: string;
}

/**
 * Token verification response
 */
export interface TokenVerificationResponse {
  isValid: boolean;
  user?: UserDto;
} 