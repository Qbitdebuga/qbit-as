import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface ServiceTokenPayload {
  serviceName: string;
  scope: string[];
  iat?: number;
  exp?: number;
}

/**
 * Service for handling Service-to-Service authentication
 * This service generates and validates JWT tokens for secure communication between microservices
 */
@Injectable()
export class ServiceTokenService {
  private readonly logger = new Logger(ServiceTokenService.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token for service-to-service communication
   * @param serviceName The name of the service requesting the token
   * @param scope Array of permissions this service token grants
   * @param expiresIn Optional token expiration (defaults to 1 hour)
   */
  async generateServiceToken(serviceName: string, scope: string[], expiresIn: string = '1h'): Promise<string> {
    this.logger.debug(`Generating service token for ${serviceName} with scope: ${scope.join(', ')}`);
    
    const payload: ServiceTokenPayload = {
      serviceName,
      scope,
    };
    
    try {
      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('SERVICE_JWT_SECRET'),
        expiresIn,
      });
      
      this.logger.debug(`Service token generated successfully for ${serviceName}`);
      return token;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const errorStack = error?.stack || '';
      this.logger.error(`Failed to generate service token: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Validates a service token
   * @param token The JWT token to validate
   * @returns The decoded token payload if valid
   */
  async validateServiceToken(token: string): Promise<ServiceTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ServiceTokenPayload>(token, {
        secret: this.configService.get<string>('SERVICE_JWT_SECRET'),
      });
      
      this.logger.debug(`Service token from ${payload.serviceName} validated successfully`);
      return payload;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const errorStack = error?.stack || '';
      this.logger.error(`Service token validation failed: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Checks if a service token has the required scope
   * @param token The JWT token to check
   * @param requiredScope The scope required for the operation
   * @returns true if the token has the required scope
   */
  async hasScope(token: string, requiredScope: string): Promise<boolean> {
    try {
      const payload = await this.validateServiceToken(token);
      return payload.scope.includes(requiredScope) || payload.scope.includes('*');
    } catch (error) {
      return false;
    }
  }
} 