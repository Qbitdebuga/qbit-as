import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServiceTokenService, SERVICE_TOKEN_OPTIONS, ServiceTokenOptions } from '../services/service-token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Service information interface
 */
export interface ServiceInfo {
  service: string;
  permissions: string[];
  [key: string]: any;
}

/**
 * A guard that validates service-to-service JWT tokens
 * 
 * This guard checks for a valid service JWT token in the Authorization header
 * and attaches the service information to the request object.
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private serviceTokenService: ServiceTokenService;

  constructor(
    private reflector: Reflector,
    @Optional() serviceTokenService?: ServiceTokenService,
    @Optional() @Inject(SERVICE_TOKEN_OPTIONS) private options?: ServiceTokenOptions,
  ) {
    if (serviceTokenService) {
      this.serviceTokenService = serviceTokenService;
    } else if (options) {
      this.serviceTokenService = new ServiceTokenService(options);
    } else {
      throw new Error('ServiceAuthGuard requires either ServiceTokenService or ServiceTokenOptions');
    }
  }

  /**
   * Checks if the request has a valid service JWT token
   * @param context The execution context
   * @returns Whether the request is allowed to proceed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is marked as public, allow access
    if (isPublic) {
      return true;
    }

    try {
      const serviceInfo = await this.validateRequest(request);
      
      // Attach the service info to the request object
      request.service = serviceInfo;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired service token');
    }
  }

  /**
   * Gets the request object from various context types
   * @param context The execution context
   * @returns The request object
   */
  private getRequest(context: ExecutionContext): any {
    // Handle HTTP context
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    
    // Handle RPC context (for microservices)
    if (context.getType() === 'rpc') {
      const rpcContext = context.switchToRpc();
      const data = rpcContext.getData() || {};
      const metadata = rpcContext.getContext() || {};
      
      // Combine data and context for RPC requests
      return { ...data, ...metadata };
    }
    
    // Handle WebSocket context
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      return client.handshake || client;
    }
    
    // Default fallback
    return context.switchToHttp().getRequest();
  }

  /**
   * Validates the token from the request
   * @param request The request object
   * @returns The service info from the token
   * @throws Error if token is invalid
   */
  private async validateRequest(request: any): Promise<ServiceInfo> {
    // Extract the token from the Authorization header
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = this.serviceTokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    // Validate the token and extract service info
    const payload = this.serviceTokenService.validateToken(token);
    
    // Create a clone of the payload without service and permissions
    // to avoid property name collisions
    const { service, permissions, ...otherClaims } = payload;
    
    return {
      service,
      permissions: permissions || [],
      ...otherClaims
    };
  }
} 