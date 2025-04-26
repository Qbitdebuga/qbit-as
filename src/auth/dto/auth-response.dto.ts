/**
 * User data for auth responses
 */
export class UserDto {
  /**
   * User ID
   * @example "507f1f77bcf86cd799439011"
   */
  id!: string;

  /**
   * User's email address
   * @example "user@example.com"
   */
  email!: string;

  /**
   * User's display name
   * @example "John Doe"
   */
  name?: string;

  /**
   * User's roles
   * @example ["user", "admin"]
   */
  roles!: string[];

  constructor(partial?: Partial<UserDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

/**
 * Data Transfer Object for authentication responses
 */
export class AuthResponseDto {
  /**
   * JWT access token (only included when cookies are not used)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken?: string;

  /**
   * Token expiration time in seconds
   * @example 3600
   */
  expiresIn!: number;

  /**
   * Currently authenticated user
   */
  user!: UserDto;

  /**
   * CSRF token for protected requests
   * @example "a1b2c3d4e5f6"
   */
  csrfToken?: string;

  constructor(partial?: Partial<AuthResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
} 