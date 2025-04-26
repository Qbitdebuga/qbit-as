import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser as CurrentUserType } from '../types/token.types';

/**
 * Parameter decorator that extracts the current user from the request
 *
 * This decorator can be used in controller methods to get access to the
 * authenticated user that was attached by the JwtAuthGuard.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@GetCurrentUser() user: CurrentUserType) {
 *   return user;
 * }
 * ```
 */
export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 