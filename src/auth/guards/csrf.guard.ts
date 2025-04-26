import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard to verify that CSRF token is present and matches the cookie token
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  /**
   * Checks if the request has a valid CSRF token
   * @param context The execution context
   * @returns Whether the request can proceed
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip for GET requests (they're safe)
    if (request.method === 'GET') {
      return true;
    }
    
    // Get the CSRF token from the request header
    const csrfHeader = request.headers['x-xsrf-token'];
    
    // Get the CSRF token from the cookie
    const csrfCookie = request.cookies['XSRF-TOKEN'];
    
    // If no CSRF token in cookie, it's an error
    if (!csrfCookie) {
      throw new ForbiddenException('CSRF protection: No CSRF token in cookie');
    }
    
    // If header doesn't match cookie, it's an error
    if (!csrfHeader || csrfHeader !== csrfCookie) {
      throw new ForbiddenException('CSRF protection: Invalid CSRF token');
    }
    
    // Token is valid
    return true;
  }
} 