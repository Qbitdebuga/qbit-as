import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SERVICE_SCOPE_KEY } from '../decorators/service-scope.decorator';

interface ServiceJwtPayload {
  serviceId: string;
  serviceName: string;
  scopes: string[];
  iat: number;
  exp: number;
}

/**
 * Guard for protecting endpoints that should only be accessible by other services
 * Uses JWT verification to validate tokens and check scopes
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Checks if the current request can activate the handler
   * @param context The execution context
   * @returns Whether the request has valid service authentication
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required scopes from handler metadata
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SERVICE_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      return true; // No scopes required
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Service authorization token is missing');
    }

    try {
      // Verify the JWT token
      const payload = await this.jwtService.verifyAsync<ServiceJwtPayload>(
        token,
        {
          secret: this.configService.get<string>('JWT_SERVICE_SECRET'),
        },
      );

      // Check if service has required scopes
      if (!this.hasRequiredScopes(payload.scopes, requiredScopes)) {
        throw new ForbiddenException(
          `Service ${payload.serviceName} lacks required scopes: ${requiredScopes.join(', ')}`,
        );
      }

      // Attach service info to request
      request.service = {
        id: payload.serviceId,
        name: payload.serviceName,
        scopes: payload.scopes,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid service token: ${error.message}`,
      );
    }
  }

  /**
   * Extracts the JWT token from the request's Authorization header
   */
  private extractTokenFromHeader(request: { headers: Record<string, string | string[]> }): string | undefined {
    const [type, token] = (request.headers.authorization?.toString() || '').split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Checks if the service has all required scopes
   * Implements wildcard matching for service scopes
   */
  private hasRequiredScopes(serviceScopes: string[], requiredScopes: string[]): boolean {
    // Check for wildcard access
    if (serviceScopes.includes('*')) {
      return true;
    }

    // Check each required scope
    return requiredScopes.every(requiredScope => 
      serviceScopes.some(serviceScope => {
        // Exact match
        if (serviceScope === requiredScope) {
          return true;
        }
        
        // Wildcard match (e.g., "accounts:*" matches "accounts:read")
        if (serviceScope.endsWith(':*')) {
          const prefix = serviceScope.slice(0, -1); // Remove the "*"
          return requiredScope.startsWith(prefix);
        }
        
        return false;
      })
    );
  }
} 