import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CurrentUser } from '../types/token.types';

/**
 * A guard that checks if the user has the required roles to access a route
 * 
 * This guard should be used after the JwtAuthGuard to ensure the user is authenticated
 * and attached to the request.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Checks if the user has the required roles to access a route
   * @param context The execution context
   * @returns Whether the request is allowed to proceed
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this?.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user as CurrentUser;

    // If no user exists on the request, deny access
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Check if user has any of the required roles
    const hasRequiredRole = this.matchRoles(requiredRoles, user.roles);
    
    if (!hasRequiredRole) {
      throw new ForbiddenException('User does not have sufficient permissions');
    }
    
    return true;
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
   * Checks if the user has any of the required roles
   * @param requiredRoles Roles required for access
   * @param userRoles Roles assigned to the user
   * @returns Whether the user has any of the required roles
   */
  private matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
    // Super admin role always has access
    if (userRoles.includes('super-admin')) {
      return true;
    }
    
    // Check if user has any of the required roles
    return requiredRoles.some(role => userRoles.includes(role));
  }
} 