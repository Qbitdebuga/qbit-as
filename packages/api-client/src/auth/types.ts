import {
  UserDto,
  CreateUserDto,
  LoginDto as LoginDtoShared,
  TokenResponseDto,
  RefreshTokenDto,
  ServiceTokenRequestDto,
  ServiceTokenResponseDto,
  ValidateTokenResponseDto,
} from '@qbit/shared-types';

// Re-export types for backward compatibility
export type User = UserDto;
export type LoginRequest = LoginDtoShared;
export type RefreshTokenRequest = RefreshTokenDto;
export type UserRegistrationRequest = CreateUserDto;

export interface AuthResponse extends TokenResponseDto {
  user: User;
}

export interface TokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
}
