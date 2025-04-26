import { SetMetadata } from '@nestjs/common';

/**
 * Key for public route metadata
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route as public, bypassing JWT authentication
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('public-route')
 * publicRoute() {
 *   return 'This route is public and can be accessed without authentication';
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); 