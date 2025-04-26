import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenValidationService, TOKEN_VALIDATION_OPTIONS, TokenValidationOptions } from '../services/token-validation.service';
import { CurrentUser } from '../types/token.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * A guard that validates JWT tokens for authenticated routes
 * 
 * This guard checks for a valid JWT token in the Authorization header
 * and attaches the decoded user to the request object.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private tokenValidationService: TokenValidationService;

  constructor(
    private reflector: Reflector,
    @Optional() tokenValidationService?: TokenValidationService,
    @Optional() @Inject(TOKEN_VALIDATION_OPTIONS) private options?: TokenValidationOptions,
  ) {
    if (tokenValidationService) {
      this.tokenValidationService = tokenValidationService;
    } else if (options) {
      this.tokenValidationService = new TokenValidationService(options);
    } else {
      throw new Error('JwtAuthGuard requires either TokenValidationService or TokenValidationOptions');
    }
  }

  /**
   * Checks if the request has a valid JWT token
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
      const user = await this.validateRequest(request);
      
      // Attach the user to the request object
      request.user = user;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
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
   * @returns The user from the token
   * @throws Error if token is invalid
   */
  private async validateRequest(request: any): Promise<CurrentUser> {
    // Extract the token from the Authorization header
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = this.tokenValidationService.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    // Validate the token and extract user
    return await this.tokenValidationService.getUserFromToken(token);
  }
} 