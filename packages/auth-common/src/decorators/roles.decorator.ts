import { SetMetadata } from '@nestjs/common';

/**
 * Key for role-based metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that specifies which roles are allowed to access a route
 * 
 * @param roles List of roles that are allowed
 * @returns Decorator function that sets the metadata
 * 
 * @example
 * ```typescript
 * @Roles('admin', 'manager')
 * @Get('protected-route')
 * protectedRoute() {
 *   return 'This route is protected and only accessible by admins and managers';
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); 