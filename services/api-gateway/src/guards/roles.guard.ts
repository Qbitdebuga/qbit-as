import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthClientService } from '../clients/auth-client.service';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly authClient: AuthClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this?.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no role is required, proceed
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Make sure user exists (JwtAuthGuard should have run first)
    if (!user) {
      this?.logger.warn('Role check failed: No user found in request');
      throw new UnauthorizedException('Authentication required');
    }

    try {
      // Get token from request (added by JwtAuthGuard)
      const authHeader = request?.headers.authorization;
      const token = authHeader.split(' ')[1];

      // Get a service token for checking roles
      const serviceToken = await this?.authClient.getServiceToken(['users:read']);

      // Check if user has required roles using the auth service
      const hasRoles = await this?.authClient.checkUserRoles(user.id, requiredRoles, serviceToken);

      if (!hasRoles) {
        this?.logger.warn(
          `User ${user.id} does not have required roles: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException('You do not have permission to access this resource');
      }

      return true;
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this?.logger.error(`Role check failed: ${error.message}`);
      throw new ForbiddenException('Role check failed');
    }
  }
}
