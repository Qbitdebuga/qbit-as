import { Injectable, Inject, Optional } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * Service token payload interface
 */
export interface ServiceTokenPayload {
  /**
   * Service name
   */
  service: string;
  
  /**
   * Service-specific permissions
   */
  permissions?: string[];
  
  /**
   * Issued at
   */
  iat?: number;
  
  /**
   * Expiration time
   */
  exp?: number;
  
  /**
   * Issuer
   */
  iss?: string;
  
  /**
   * Additional claims
   */
  [key: string]: any;
}

/**
 * Configuration options for the ServiceTokenService
 */
export interface ServiceTokenOptions {
  /**
   * JWT secret key for service tokens
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
}

/**
 * Injection token for the ServiceTokenOptions
 */
export const SERVICE_TOKEN_OPTIONS = 'SERVICE_TOKEN_OPTIONS';

/**
 * Default service token options
 */
const DEFAULT_OPTIONS: Partial<ServiceTokenOptions> = {
  expiresIn: 3600, // 1 hour
};

/**
 * Service for generating and validating service-to-service JWT tokens
 * 
 * This service is used for secure authentication between microservices.
 */
@Injectable()
export class ServiceTokenService {
  private readonly options: ServiceTokenOptions;

  /**
   * Creates an instance of ServiceTokenService
   */
  constructor(
    @Optional() @Inject(SERVICE_TOKEN_OPTIONS) options?: ServiceTokenOptions,
  ) {
    if (!options || !options.secret) {
      throw new Error('JWT secret is required for ServiceTokenService');
    }
    
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Generates a new service JWT token
   * 
   * @param serviceName The name of the service
   * @param permissions Optional service-specific permissions
   * @param additionalClaims Additional claims to include in the token
   * @returns The generated JWT token
   */
  generateToken(
    serviceName: string, 
    permissions: string[] = [],
    additionalClaims: Record<string, any> = {}
  ): string {
    const payload: ServiceTokenPayload = {
      service: serviceName,
      permissions,
      ...additionalClaims,
    };
    
    const tokenOptions: jwt.SignOptions = {
      expiresIn: this.options.expiresIn,
    };
    
    if (this.options.issuer) {
      tokenOptions.issuer = this.options.issuer;
    }
    
    return jwt.sign(payload, this.options.secret, tokenOptions);
  }

  /**
   * Validates a service JWT token
   * 
   * @param token The JWT token to validate
   * @returns The decoded service token payload
   * @throws Error if token is invalid
   */
  validateToken(token: string): ServiceTokenPayload {
    try {
      const payload = jwt.verify(token, this.options.secret, {
        issuer: this.options.issuer,
      }) as ServiceTokenPayload;
      
      if (!payload.service) {
        throw new Error('Invalid service token');
      }
      
      return payload;
    } catch (error) {
      throw new Error(`Invalid service token: ${error.message}`);
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
} 