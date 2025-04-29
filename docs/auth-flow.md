# Authentication Flow Documentation

## Overview

This document describes the authentication flow and related components in the Qbit Accounting System. The system uses a JWT-based authentication mechanism with role-based access control.

## Table of Contents

1. [Architecture](#architecture)
2. [Key Components](#key-components)
3. [Authentication Flow](#authentication-flow)
4. [Token Management](#token-management)
5. [Authorization](#authorization)
6. [Cross-Service Authentication](#cross-service-authentication)
7. [Error Handling](#error-handling)
8. [Development Mode](#development-mode)
9. [Best Practices](#best-practices)

## Architecture

The Qbit authentication system is built around these principles:

- **Centralized Auth Service**: Handles user registration, login, and token validation
- **JWT-based Authentication**: Stateless authentication using signed JWT tokens
- **Role-Based Access Control (RBAC)**: Granular permissions via role assignments
- **Cookie + LocalStorage**: Dual storage strategy for maximum compatibility
- **CSRF Protection**: Prevention of cross-site request forgery attacks

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│             │       │              │       │              │
│  Web Client ├───────► API Gateway  ├───────►  Auth Service│
│             │       │              │       │              │
└─────────────┘       └──────────────┘       └──────────────┘
                             │                      │
                             ▼                      ▼
                      ┌──────────────┐      ┌──────────────┐
                      │  Service 1   │      │  User        │
                      │  (GL, etc.)  │◄─────┤  Database    │
                      │              │      │              │
                      └──────────────┘      └──────────────┘
```

## Key Components

### 1. Auth Service

The core authentication service that manages users, roles, and tokens.

- Located in `services/auth/`
- Provides APIs for registration, login, token refresh, and validation

### 2. Auth Common Package

Shared utilities and types for authentication across services.

- Located in `packages/auth-common/`
- Contains guards, decorators, and configuration settings

### 3. API Client

Provides client-side authentication utilities.

- Located in `packages/api-client/`
- Contains `AuthClient` and token storage mechanism

### 4. React Auth Context

Frontend authentication state management.

- Located in `apps/web/src/contexts/auth-context.tsx`
- Provides the `useAuth()` hook for components to access auth state

### 5. Protected Route Component

Component for securing routes based on authentication and roles.

- Located in `apps/web/src/components/auth/ProtectedRoute.tsx`
- Guards routes from unauthorized access

## Authentication Flow

### Registration Flow

1. User submits registration form with email, password, and name
2. `AuthClient.register()` sends credentials to Auth Service
3. Auth Service creates user account and assigns default roles
4. User is automatically logged in after successful registration

### Login Flow

1. User submits login form with email and password (optional "remember me")
2. `AuthClient.login()` sends credentials to Auth Service
3. Auth Service validates credentials and generates JWT token pair
   - Access token (short-lived, typically 1 hour)
   - Refresh token (long-lived, typically 30 days)
4. Tokens are stored in both localStorage and cookies
5. User data is stored in the auth context and TokenStorage

```
┌─────────┐                 ┌──────────────┐         ┌──────────────┐
│         │                 │              │         │              │
│ Browser │──── login ─────►│ API Gateway  │─────────► Auth Service │
│         │                 │              │         │              │
└─────────┘                 └──────────────┘         └──────────────┘
     ▲                                                      │
     │                                                      │
     │             ┌───────────────────────────────────────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     └──────┤ JWT Response │
            │ (tokens)     │
            └──────────────┘
```

### Token Refresh Flow

1. When making authenticated requests, the client includes the access token
2. If the access token expires, the system attempts to refresh it using the refresh token
3. `AuthClient.refreshToken()` sends the refresh token to Auth Service
4. Auth Service validates the refresh token and issues a new access token
5. TokenStorage updates the stored access token

### Logout Flow

1. User initiates logout
2. Client-side tokens are immediately cleared from storage
3. `AuthClient.logout()` attempts to hit the server logout endpoint
4. User is redirected to the login page (except in DEV_MODE)

## Token Management

### Token Storage

The `TokenStorage` class in `packages/api-client/src/utils/token-storage.ts` manages token storage with:

- **Dual Storage**: Stores tokens in both localStorage and cookies for maximum compatibility
- **Encryption**: Safeguards sensitive data
- **Expiration**: Manages token expiry times
- **CSRF Protection**: Stores CSRF token for cookie-based auth

### Token Types

1. **Access Token**: Short-lived JWT token for API access
2. **Refresh Token**: Long-lived token to obtain new access tokens
3. **CSRF Token**: Token to prevent cross-site request forgery

## Authorization

### Role-Based Access Control

The system uses role-based access control (RBAC) with roles including:

- `admin`: Full system access
- `user`: Standard user access
- `manager`: Management capabilities
- `accountant`: Financial operation access
- `support`: Customer support access

### Role Checking

Role verification happens at multiple levels:

1. **Frontend**: `ProtectedRoute` component and `useAuth().hasRole()`
2. **API Gateway**: `RolesGuard` and `JwtAuthGuard`
3. **Services**: Service-specific guards

### Route Protection

The `ProtectedRoute` component in `apps/web/src/components/auth/ProtectedRoute.tsx` secures routes based on:

- Authentication status
- Role requirements
- Custom redirection

## Cross-Service Authentication

### Service-to-Service Authentication

Services authenticate with each other using service tokens:

1. Service requests a token from Auth Service using service credentials
2. Service includes token in requests to other services
3. Receiving service validates token before processing request

### User Context Propagation

User context is propagated across services:

1. User identity and roles are included in service requests
2. Services validate and extract user information from tokens
3. User actions are logged with their identity

## Error Handling

Authentication errors are handled with a standardized approach defined in `apps/web/src/utils/error-handler.ts`:

1. **Standardized Error Format**: All errors follow the `ErrorDetails` interface
2. **Error Categorization**: Errors are categorized by type (auth, network, validation, etc.)
3. **User-Friendly Messages**: Errors are translated to user-friendly messages
4. **Consistent Logging**: Structured error logging for monitoring

### Common Error Types

- **Auth Errors**: Invalid credentials, expired tokens, etc.
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid input data
- **Permission Errors**: Insufficient permissions for an action

## Development Mode

The system includes a special development mode to facilitate testing:

1. **DEV_MODE Flag**: Configured in `packages/auth-common/src/config.ts`
2. **Authentication Bypass**: When enabled, skips certain auth checks
3. **No Redirections**: Prevents automatic redirects during development
4. **Visual Indicator**: Shows a development mode indicator in the UI

## Best Practices

### Frontend Auth Best Practices

1. **Always use `useAuth()` hook** instead of directly accessing tokens
2. **Protect all private routes** with the `ProtectedRoute` component
3. **Check roles** before rendering sensitive UI elements
4. **Handle loading states** to prevent content flashing
5. **Provide user-friendly error messages** for auth failures

### Backend Auth Best Practices

1. **Validate tokens** on every secure endpoint
2. **Check permissions** before performing sensitive operations
3. **Keep token validation logic centralized** in guards
4. **Use decorators** like `@CurrentUser()` to access user data
5. **Follow principle of least privilege** when assigning roles

### General Security Best Practices

1. **Never store sensitive data** in localStorage or unencrypted cookies
2. **Always use HTTPS** for production environments
3. **Implement proper CORS settings** to prevent unauthorized access
4. **Set secure and httpOnly flags** on sensitive cookies
5. **Rotate tokens regularly** to minimize impact of token leakage
6. **Set appropriate token expiration times** (short for access tokens)
7. **Use Content Security Policy (CSP)** to prevent XSS attacks

## Appendix

### Related Configuration Files

- `packages/auth-common/src/config.ts`: Central auth configuration
- `packages/auth-common/src/guards/`: Authentication guards
- `packages/auth-common/src/decorators/`: Auth-related decorators

### Testing Authentication

The system includes comprehensive authentication tests:

- `apps/web/src/__tests__/auth/auth-flow.test.tsx`: Tests the authentication flow
- `apps/web/src/__tests__/auth/protected-route.test.tsx`: Tests the route protection 