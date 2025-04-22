# Service-to-Service Authentication

This module provides service-to-service authentication for the Qbit Accounting System microservices architecture. It enables secure communication between services by generating and validating JWT tokens.

## Overview

The service-to-service authentication module includes:

1. **Token Generation**: Services can request authentication tokens from the Auth Service
2. **Token Validation**: Guards that verify tokens used for service-to-service communication
3. **Scope-Based Authorization**: Services can be restricted to specific actions based on their scopes

## Setup

1. Add the required environment variables:

```
SERVICE_JWT_SECRET=your-secure-secret-key

# Define API keys for each service that will communicate with the Auth Service
SERVICE_API_KEY_GENERAL_LEDGER=your-gl-service-api-key
SERVICE_API_KEY_API_GATEWAY=your-api-gateway-service-api-key
```

2. Import and use the `ServiceAuthGuard` to protect endpoints that should only be accessed by other services:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ServiceAuthGuard } from './guards/service-auth.guard';
import { RequireServiceScope } from './decorators/service-scope.decorator';

@Controller('internal')
export class InternalController {
  @Get('users')
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('read:users')
  getUsersForService() {
    // This endpoint is only accessible to services with a valid token
    // that includes the 'read:users' scope
    return this.userService.findAll();
  }
}
```

## How It Works

### Requesting Service Tokens

Services need to authenticate with the Auth Service and request a token:

1. Make a POST request to `/auth/service-token` with:
   - `serviceName`: The name of the service (matching the API key environment variable)
   - `apiKey`: The secret API key for the service
   - `scope`: Array of requested permission scopes
   - `expiresIn`: Optional token expiration (defaults to 1 hour)

2. The Auth Service validates the API key and returns a JWT token if valid

### Using Service Tokens

Services should:

1. Store the service token securely (short-lived, can be refreshed as needed)
2. Include the token in requests to other services as a Bearer token
3. Respect scope limitations and only request necessary permissions

### Token Validation

When a service receives a request with a service token:

1. The `ServiceAuthGuard` extracts and validates the token
2. It checks if the token's scope includes the required permission
3. If valid, the request proceeds; otherwise, it's rejected

## Security Considerations

- Rotate `SERVICE_JWT_SECRET` and service API keys regularly
- Use HTTPS for all service-to-service communication
- Limit scopes to only what each service needs
- Keep token lifetimes short (1 hour or less)
- Store API keys securely and never expose them in client-side code

## Error Handling

Common errors:

- `401 Unauthorized`: Invalid or missing API key
- `401 Unauthorized`: Invalid service token
- `403 Forbidden`: Valid token but insufficient scope 