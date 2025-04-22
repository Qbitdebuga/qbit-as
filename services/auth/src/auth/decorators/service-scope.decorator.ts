import { SetMetadata } from '@nestjs/common';

/**
 * Key for storing service scope metadata
 */
export const REQUEST_SERVICE_SCOPE = 'service_scope';

export const SERVICE_SCOPE_KEY = 'requiredServiceScope';

/**
 * Decorator to specify the required service scope for a route
 * @param scope The scope a service must have to access the endpoint
 */
export const RequireServiceScope = (...scopes: string[]) => SetMetadata(SERVICE_SCOPE_KEY, scopes); 