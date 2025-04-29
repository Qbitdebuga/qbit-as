# @qbit/auth-common

Common authentication utilities and configuration for the Qbit Accounting System.

## Overview

The `auth-common` package provides shared authentication functionality across all Qbit services and applications. It centralizes authentication configuration, guards, decorators, and utilities to ensure consistent authentication behavior throughout the system.

## Installation

```bash
# From the repository root
yarn workspace @qbit/auth-common install
```

## Key Features

- **Centralized Configuration**: Single source of truth for authentication settings
- **JWT Auth Guards**: Protect routes and endpoints with JWT validation
- **Role Guards**: Enforce role-based access control
- **Service Auth**: Facilitate secure service-to-service communication
- **Auth Decorators**: Easy access to user and service context in controllers
- **Constants & Types**: Shared constants and TypeScript types for authentication

## Usage

### Configuration

Import and use the centralized authentication configuration:

```typescript
import { AUTH_ENDPOINTS, DEV_MODE, TOKEN_CONFIG } from '@qbit/auth-common';

// Use configured endpoints for authentication requests
const loginUrl = AUTH_ENDPOINTS.login;

// Check development mode
if (DEV_MODE) {
  console.log('Running in development mode - certain auth checks are bypassed');
}

// Use token configuration
const tokenKey = TOKEN_CONFIG.accessTokenKey;
```

### Guards

Protect NestJS endpoints with the included guards:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@qbit/auth-common';
import { Roles } from '@qbit/auth-common';

@Controller('sensitive-data')
export class SensitiveDataController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'accountant'])
  getSensitiveData() {
    return { message: 'This is sensitive data' };
  }
}
```

### Service Authentication

Authenticate service-to-service communication:

```typescript
import { Injectable } from '@nestjs/common';
import { ServiceTokenService, ServiceAuthGuard } from '@qbit/auth-common';

@Injectable()
export class ServiceClient {
  constructor(private readonly serviceTokenService: ServiceTokenService) {}

  async callAnotherService() {
    const token = await this.serviceTokenService.getToken({
      serviceName: 'my-service',
      apiKey: process.env.SERVICE_API_KEY
    });

    return fetch('https://other-service/api/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
```

### Current User Decorator

Access the current user in controllers:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@qbit/auth-common';
import { User } from '@qbit/shared-types';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### Development Mode

The `DEV_MODE` flag is used to bypass certain authentication checks during development:

```typescript
import { DEV_MODE } from '@qbit/auth-common';

function someSecureOperation() {
  if (DEV_MODE) {
    // Skip auth checks in development
    return mockData;
  }
  
  // Perform real authentication in production
  // ...
}
```

## Architecture

This package follows a modular architecture where each authentication concern is separated:

- **Config**: Central configuration for all auth-related settings
- **Guards**: Authentication and authorization guards
- **Decorators**: Custom parameter decorators for auth context
- **Services**: Token generation and validation services
- **Interfaces**: Type definitions for auth components

## API Reference

### Configuration

- `AUTH_ENDPOINTS`: Authentication API endpoints
- `TOKEN_CONFIG`: Token-related configuration
- `DEV_MODE`: Development mode flag

### Guards

- `JwtAuthGuard`: Validates JWT tokens for user authentication
- `RolesGuard`: Enforces role-based access control
- `ServiceAuthGuard`: Validates service-to-service authentication

### Decorators

- `@CurrentUser()`: Extracts the current user from request
- `@CurrentService()`: Extracts the calling service from request
- `@Roles()`: Specifies required roles for an endpoint

### Services

- `ServiceTokenService`: Manages service-to-service authentication tokens

## For More Information

For a complete explanation of the authentication flow, please refer to the [Authentication Flow Documentation](../../docs/auth-flow.md).

## Testing

```bash
# From the repository root
yarn workspace @qbit/auth-common test
```

## License

Internal use only - Qbit Accounting System 