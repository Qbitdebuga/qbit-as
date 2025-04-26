import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ServiceInfo } from '../guards/service-auth.guard';

/**
 * Parameter decorator that extracts the current service from the request
 *
 * This decorator can be used in controller methods to get access to the
 * authenticated service that was attached by the ServiceAuthGuard.
 *
 * @example
 * ```typescript
 * @Get('info')
 * @UseGuards(ServiceAuthGuard)
 * getServiceInfo(@GetCurrentService() service: ServiceInfo) {
 *   return { message: `Hello ${service.service}!` };
 * }
 * ```
 */
export const GetCurrentService = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ServiceInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.service;
  },
); 