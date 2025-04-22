# Auth Service

This service manages user authentication, authorization, and service-to-service authentication for the Qbit Accounting System.

## Service Authentication

The Auth Service provides support for service-to-service authentication using JWT tokens. This enables secure communication between microservices.

### Configuration

Service authentication is configured through environment variables:

```
# JWT configuration for service tokens
SERVICE_JWT_SECRET=your-service-secret-key
SERVICE_JWT_EXPIRES_IN=1d

# Service Configuration
# Format: SERVICE_[ID]_SECRET and SERVICE_[ID]_SCOPES
SERVICE_GL_SECRET=your-gl-service-secret
SERVICE_GL_SCOPES=gl:read,gl:write
SERVICE_API_SECRET=your-api-gateway-secret
SERVICE_API_SCOPES=*
SERVICE_REPORTING_SECRET=your-reporting-service-secret
SERVICE_REPORTING_SCOPES=gl:read,reporting:read,reporting:write
```

### How Service Authentication Works

1. **Service Registration**: Each service is registered with the Auth Service through environment variables.
2. **Token Generation**: Services request tokens from the Auth Service by providing their service ID, name, and required scopes.
3. **Token Validation**: When receiving requests from other services, the ServiceAuthGuard validates the token and verifies that the service has the required scopes.

### Using Service Authentication in Other Services

Other services can use the `ServiceTokenClient` to obtain tokens from the Auth Service:

```typescript
import { ServiceTokenClient } from '@qbit/auth-service-client';

// Initialize the client
const tokenClient = new ServiceTokenClient({
  authServiceUrl: 'http://auth-service:3002',
  serviceId: 'gl',
  serviceName: 'General Ledger Service',
  serviceSecret: process.env.SERVICE_GL_SECRET,
});

// Get a token with specific scopes
const token = await tokenClient.getToken(['gl:read', 'gl:write']);

// Use the token in a request to another service
const headers = await tokenClient.getAuthHeader(['gl:read']);
const response = await axios.get('http://other-service/api/resource', { 
  headers 
});
```

### Guards

The Auth Service provides the following guards:

- **ServiceAuthGuard**: Validates service-to-service tokens
- **AdminAuthGuard**: Ensures the requesting user has the admin role

## API Endpoints

- `POST /service-tokens` - Generate a service token (admin only)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token

## Development

To run the service locally:

```
npm install
npm run start:dev
```

To build the service for production:

```
npm run build
npm run start:prod
```

## Features

- User authentication and authorization
- JWT-based token management
- User management (CRUD operations)
- Role-based access control
- Event publishing for cross-service data synchronization

## Setup

### Prerequisites

- Node.js 16+
- PostgreSQL
- RabbitMQ (for event publishing)

### Environment Setup

1. Create an `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

2. Update the environment variables as needed.

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed the database
npm run db:seed
```

### Running the Service

```bash
# Development mode
npm run dev

# Production mode
npm run start:prod
```

## Event Publishing

This service publishes events to RabbitMQ when users and roles are created, updated, or deleted. To enable event publishing, install the required dependencies:

```bash
npm install @nestjs/microservices amqp-connection-manager amqplib
```

The following events are published:

- `user.created` - When a new user is created
- `user.updated` - When a user is updated
- `user.deleted` - When a user is deleted
- `role.created` - When a new role is created
- `role.updated` - When a role is updated
- `role.deleted` - When a role is deleted

Events follow a standard format and are published to the RabbitMQ exchange specified in the `.env` file.

## Event-Driven Architecture

This service is part of a microservices architecture that uses event-driven communication for data consistency across services. The events module handles publishing events to RabbitMQ when entity changes occur.

See the [Events Module README](src/events/README.md) for more details on event publishing. 