import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // For now, this is a mock implementation that always returns true
    // When we integrate with the auth service, this will be replaced
    return true;
  }
} 