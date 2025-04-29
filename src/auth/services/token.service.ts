import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  sub: string;       // Subject (user ID)
  username?: string; // Username
  email?: string;    // Email
  roles?: string[];  // User roles
  type?: string;     // Token type (access or refresh)
  [key: string]: string | string[] | number | boolean | undefined; // Other custom properties with specific types
}

/**
 * Interface for token pair (access and refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Service for JWT token generation and validation
 */
@Injectable()
export class TokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor(private configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('app.jwt.secret');
    this.jwtExpiresIn = this.configService.get<string>('app.jwt.expiresIn', '1h');
    this.jwtRefreshExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn', '7d');
  }

  /**
   * Generate a new access token and refresh token pair
   * 
   * @param payload JWT payload data
   * @returns Object containing access token, refresh token, and expiration
   */
  generateTokens(payload: Omit<JwtPayload, 'type'>): TokenPair {
    // Calculate expiration in seconds
    const expiresInSeconds = this.parseExpiresIn(this.jwtExpiresIn);

    // Generate access token
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
    };
  }

  /**
   * Validate an access token
   * 
   * @param token Access token to validate
   * @returns Decoded token payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  validateAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      
      // Verify this is an access token
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Validate a refresh token
   * 
   * @param token Refresh token to validate
   * @returns Decoded token payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  validateRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      
      // Verify this is a refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Refresh an access token using a valid refresh token
   * 
   * @param refreshToken The refresh token
   * @returns New token pair (access and refresh)
   * @throws UnauthorizedException if refresh token is invalid
   */
  refreshTokens(refreshToken: string): TokenPair {
    // Verify the refresh token
    const payload = this.validateRefreshToken(refreshToken);
    
    // Remove unnecessary properties
    delete payload.exp;
    delete payload.iat;
    delete payload.type;
    
    // Generate new tokens
    return this.generateTokens(payload);
  }

  /**
   * Extract token from authorization header
   * 
   * @param authHeader The Authorization header value
   * @returns The extracted token or null if not found
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Parse the expiresIn string to seconds
   * 
   * @param expiresIn Time string like '1h', '7d', etc.
   * @returns Time in seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const units = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (match) {
      const [, value, unit] = match;
      return parseInt(value, 10) * units[unit as keyof typeof units];
    }
    
    // If it's a number, assume it's in seconds
    if (!isNaN(Number(expiresIn))) {
      return parseInt(expiresIn, 10);
    }
    
    // Default to 1 hour
    return 3600;
  }
} 