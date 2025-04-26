import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

/**
 * Data Transfer Object for login requests
 */
export class LoginDto {
  /**
   * User's email address
   * @example "user@example.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /**
   * User's password
   * @example "password123"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  /**
   * Remember me flag for extending session duration
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
} 