# Qbit Accounting System: Project Structure Documentation

## System Overview

Qbit Accounting is a modern, microservices-based accounting system designed for scalability, maintainability, and extensibility. The system follows a modular architecture pattern where each functional area is served by its own independent microservice.

## Directory Structure

```
qbit-as/
├── apps/                  # Front-end applications
│   └── web/               # Next.js web application
├── packages/              # Shared libraries and utilities
│   ├── api-client/        # API client for consuming backend services
│   ├── errors/            # Error handling utilities
│   ├── events/            # Event handling for service communication
│   ├── logging/           # Centralized logging utilities
│   ├── shared-types/      # Shared TypeScript interfaces and types
│   ├── tracing/           # Distributed tracing utilities
│   ├── ui-components/     # Reusable UI components
│   └── utils/             # Common utility functions
├── services/              # Backend microservices
│   ├── accounts-payable/  # Manages vendor invoices and payments
│   ├── accounts-receivable/ # Manages customer invoices and receipts
│   ├── api-gateway/       # API Gateway for routing requests
│   ├── auth/              # Authentication and authorization
│   ├── banking/           # Bank account management and reconciliation
│   ├── fixed-assets/      # Fixed assets tracking and depreciation
│   ├── general-ledger/    # Core accounting and financial statements
│   ├── inventory/         # Inventory tracking and management
│   └── reporting/         # Financial and business reporting
└── scripts/               # Utility scripts for development and deployment
```

## Service Architecture

Each microservice follows a consistent internal structure:

```
service-name/
├── prisma/               # Database schema and migrations
├── src/
│   ├── config/           # Service configuration
│   ├── controllers/      # API endpoints
│   ├── dto/              # Data transfer objects
│   ├── entities/         # Data models
│   ├── events/           # Event handlers and publishers
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic
│   ├── utils/            # Service-specific utilities
│   ├── app.module.ts     # Main application module
│   └── main.ts           # Application entry point
├── test/                 # Unit and integration tests
├── .env.example          # Environment variable template
├── Dockerfile            # Container definition
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Service Communication Patterns

The system uses two primary communication patterns:

1. **Synchronous Communication**: Direct HTTP/REST APIs used for request-response patterns using the API Gateway
2. **Asynchronous Communication**: Event-based messaging for decoupled communication between services using RabbitMQ

## Port Assignments

Each service is assigned a unique port to avoid conflicts:

| Service             | Port |
|---------------------|------|
| API Gateway         | 3000 |
| Web App             | 3001 |
| Auth Service        | 3002 |
| General Ledger      | 3003 |
| Accounts Receivable | 3004 |
| Accounts Payable    | 3005 |
| Inventory           | 3006 |
| Fixed Assets        | 3007 |
| Banking             | 3008 |

## Database Architecture

Each microservice has its own dedicated database to ensure decoupling:

- PostgreSQL is used as the primary database
- Prisma ORM is used for database access and migrations
- Data synchronization between services is handled via events

## Authentication Flow

1. Users authenticate via the Auth Service
2. The Auth Service issues JWT tokens
3. Tokens are validated by the API Gateway for each request
4. Service-to-service communication uses dedicated service tokens

## Deployment

The system can be deployed using:

- Docker Compose for development environments
- Kubernetes for production environments

For more information on deployment, see [deployment documentation](./deployment.md).

## Development Workflow

1. Use the `yarn dev` command to start services in development mode
2. Run `yarn build` to create production builds
3. Execute `yarn test` to run unit and integration tests

For more details on the development workflow, see [development documentation](./development.md).

## Event Messaging

The system uses a event-driven architecture for inter-service communication:

- Events are published when significant state changes occur
- Services subscribe to relevant events and react accordingly
- The events package provides standardized interfaces for event publication and consumption

For more information on the event system, see [events documentation](./events.md). 