/**
 * Authentication related DTOs
 */
import { UserDto } from '../models/user';

/**
 * Login request DTO
 */
export interface LoginDto {
  email: string | null;
  password: string | null;
  rememberMe?: boolean | null;
}

/**
 * Registration request DTO
 */
export interface RegisterDto {
  email: string | null;
  password: string | null;
  name?: string | null;
}

/**
 * Email verification request DTO
 */
export interface VerifyEmailDto {
  token: string | null;
}

/**
 * Password reset request DTO
 */
export interface RequestPasswordResetDto {
  email: string | null;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDto {
  token: string | null;
  password: string | null;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string | null;
  newPassword: string | null;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDto {
  refreshToken: string | null;
}

/**
 * Service-to-service authentication token request
 */
export interface ServiceTokenRequestDto {
  serviceId: string | null;
  serviceName: string | null;
  apiKey?: string | null;
  scopes?: string[];
  expiresIn?: number | null;
}

/**
 * Auth response with tokens and user information
 */
export interface AuthResponseDto {
  user: UserDto;
  accessToken: string | null;
  refreshToken?: string | null;
  expiresIn: number | null;
  csrfToken?: string | null;
}

/**
 * Token verification response
 */
export interface TokenVerificationResponse {
  isValid: boolean | null;
  user?: UserDto;
}
