import { Injectable, Inject, Optional } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, CurrentUser, TokenPayload } from '../types/token.types';

/**
 * Configuration options for the TokenValidationService
 */
export interface TokenValidationOptions {
  /**
   * JWT secret key
   */
  secret: string;
  
  /**
   * JWT expiration time in seconds
   * @default 3600 (1 hour)
   */
  expiresIn?: number;
  
  /**
   * JWT issuer
   */
  issuer?: string;
  
  /**
   * JWT audience
   */
  audience?: string;
}

/**
 * Default module options
 */
const DEFAULT_OPTIONS: Partial<TokenValidationOptions> = {
  expiresIn: 3600, // 1 hour
};

/**
 * Injection token for the TokenValidationOptions
 */
export const TOKEN_VALIDATION_OPTIONS = 'TOKEN_VALIDATION_OPTIONS';

/**
 * Service for validating JWT tokens
 */
@Injectable()
export class TokenValidationService {
  private readonly options: TokenValidationOptions;

  /**
   * Creates an instance of TokenValidationService
   */
  constructor(
    @Optional() @Inject(TOKEN_VALIDATION_OPTIONS) options?: TokenValidationOptions,
  ) {
    if (!options || !options.secret) {
      throw new Error('JWT secret is required for TokenValidationService');
    }
    
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Validates a JWT token and returns the decoded payload
   * @param token The JWT token to validate
   * @param secret The secret used to sign the token
   * @returns The decoded token payload or null if validation fails
   */
  validateToken(token: string, secret: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decodes a JWT token without verifying the signature
   * @param token The JWT token to decode
   * @returns The decoded token payload or null if decoding fails
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extracts the token from the Authorization header
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
   * Validates a JWT token and returns the payload
   * 
   * @param token The JWT token to validate
   * @returns The decoded JWT payload
   * @throws Error if token is invalid
   */
  async validateTokenFromService(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, this.options.secret, {
        issuer: this.options.issuer,
        audience: this.options.audience,
      }) as JwtPayload;
      
      return payload;
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Extracts user information from a JWT token
   * 
   * @param token The JWT token
   * @returns User information
   * @throws Error if token is invalid
   */
  async getUserFromToken(token: string): Promise<CurrentUser> {
    const payload = await this.validateTokenFromService(token);
    
    // Extract specific properties and then spread remaining properties
    const { sub, username, email, roles = [], ...restPayload } = payload;
    
    return {
      id: sub,
      username,
      email,
      roles,
      ...restPayload,
    };
  }

  /**
   * Generates a new JWT token
   * 
   * @param payload The data to be encoded in the token
   * @returns The generated JWT token
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
    const tokenOptions: jwt.SignOptions = {
      expiresIn: this.options.expiresIn,
    };
    
    if (this.options.issuer) {
      tokenOptions.issuer = this.options.issuer;
    }
    
    if (this.options.audience) {
      tokenOptions.audience = this.options.audience;
    }
    
    return jwt.sign(payload, this.options.secret, tokenOptions);
  }

  /**
   * Checks if a token is expired
   * 
   * @param decodedToken The decoded token payload
   * @returns true if expired, false otherwise
   */
  isTokenExpired(decodedToken: TokenPayload): boolean {
    if (!decodedToken.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  }
} 