import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this?.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If no user or no roles array, deny access
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('User does not have sufficient permissions');
    }

    // Check if user has at least one of the required roles
    const hasRole = requiredRoles.some(role => user?.roles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException('User does not have sufficient permissions');
    }

    return true;
  }
} 