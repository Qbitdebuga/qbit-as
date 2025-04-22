# Auth Service Events Module

This module handles event publishing and consumption for the Auth microservice in the Qbit Accounting System.

## Purpose

The Events module allows the Auth service to communicate with other microservices using an event-driven approach. It publishes events when users and roles are created, updated, or deleted, allowing other services to react accordingly.

## Setup

### Dependencies

To use this module, you need to install the following dependencies:

```bash
npm install @nestjs/microservices amqp-connection-manager amqplib
```

For convenience, you can use the setup scripts provided:

- Linux/Mac: `chmod +x scripts/setup-events.sh && ./scripts/setup-events.sh`
- Windows: `.\scripts\setup-events.ps1`

### Enabling the Module

After installing dependencies, you need to:

1. Uncomment the ClientsModule in `events.module.ts`
2. Uncomment the `@InjectClient('RABBITMQ_SERVICE')` in both `user-publisher.ts` and `role-publisher.ts`
3. Remove the `private readonly client: any` line in the publishers

### Configuration

Make sure your .env file contains the following RabbitMQ related settings:

```
# RabbitMQ
RABBITMQ_URL=amqp://qbit:qbit_password@localhost:5672
RABBITMQ_QUEUE=auth_queue
RABBITMQ_EXCHANGE=qbit_events
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

## Usage

The module exports publishers that can be injected into services:

```typescript
constructor(private readonly userPublisher: UserPublisher) {}

async createUser(dto: CreateUserDto) {
  const user = await this.userRepository.create(dto);
  await this.userPublisher.publishUserCreated(user);
  return user;
}
```

## Troubleshooting

If you encounter issues with event publishing:

1. Ensure RabbitMQ is running: `docker-compose ps | grep rabbitmq`
2. Check RabbitMQ logs: `docker-compose logs rabbitmq`
3. Verify your .env configuration is correct
4. Make sure all required dependencies are installed

## Extending This Module

To add new event types:

1. Define the event pattern in `constants/event-patterns.ts`
2. Create a publisher in the `publishers` directory
3. Register the publisher in the EventsModule and export it
4. Import the EventsModule in the module where you want to use the publisher 