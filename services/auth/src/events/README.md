# Auth Service - Events Module

This module enables the Auth Service to publish events to other services via RabbitMQ.

## Overview

The Events module is responsible for:

1. Publishing user-related events (creation, updates, deletion)
2. Handling authentication events (login, logout, password changes)
3. Broadcasting role and permission changes

## Installation

To add event support to the Auth Service, install the required dependencies:

```bash
yarn add @nestjs/microservices amqp-connection-manager amqplib
```

## Configuration

Events configuration is handled through environment variables:

```
# RabbitMQ Connection
RABBITMQ_URL=amqp://user:password@rabbitmq:5672
RABBITMQ_EXCHANGE=auth_events
RABBITMQ_QUEUE=auth_queue
```

## Usage

To publish an event from a service:

```typescript
// Inject the EventsService
constructor(private readonly eventsService: EventsService) {}

// Publish an event
this.eventsService.publishUserCreated(user);
```

## Event Types

### User Events

- `user.created`: Published when a new user is created
- `user.updated`: Published when a user is updated
- `user.deleted`: Published when a user is deleted

### Role Events

- `role.created`: Published when a new role is created
- `role.updated`: Published when a role is updated
- `role.deleted`: Published when a role is deleted

## Event Format

All events follow this standard format:

```javascript
{
  serviceSource: 'auth-service',
  entityType: 'user' | 'role',
  timestamp: '2023-01-01T00:00:00.000Z', // ISO string
  data: {
    id: 'user-id',
    // Other entity fields, excluding sensitive data
  },
  previousData: { // Only for update events
    // Previous entity state
  }
}
```

## Troubleshooting

If you encounter issues with event publishing:

1. Ensure RabbitMQ is running: `