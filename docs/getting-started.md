# Getting Started with Qbit Accounting System

This guide will help you set up your development environment and run the Qbit Accounting System locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **Yarn** (version 3.x)
- **Docker** and **Docker Compose** (for running local services)
- **Git** (for version control)
- **PostgreSQL** (version 15 recommended)
- **Visual Studio Code** (recommended IDE) with the following extensions:
  - ESLint
  - Prettier
  - Prisma
  - TypeScript

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/qbit-as.git
cd qbit-as
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment files:

```bash
cp .env.example .env
```

Update the environment variables in `.env` with your local settings.

### 4. Start Development Services

Start the required services using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis
- RabbitMQ
- NATS message queue
- Jaeger (for tracing)

### 5. Apply Database Migrations

```bash
yarn prisma migrate dev
```

### 6. Seed the Database (Optional)

```bash
yarn prisma:seed
```

### 7. Start the Development Server

```bash
yarn dev
```

This will start all services in development mode. You can access the web app at [http://localhost:3000](http://localhost:3000).

## Project Structure

The Qbit Accounting System is structured as a monorepo using Turborepo:

- `apps/web` - Next.js frontend application
- `packages/*` - Shared packages and utilities
  - `packages/shared-types` - Shared TypeScript types
  - `packages/errors` - Error handling utilities
  - `packages/api-client` - API client for frontend
  - `packages/utils` - Shared utility functions
  - `packages/events` - Event-driven architecture utilities
  - `packages/logging` - Centralized logging
  - `packages/tracing` - Distributed tracing
- `services/*` - Backend microservices
  - `services/api-gateway` - API Gateway
  - `services/auth` - Authentication service
  - `services/general-ledger` - General Ledger service
  - `services/accounts-payable` - Accounts Payable service
  - `services/accounts-receivable` - Accounts Receivable service
  - `services/inventory` - Inventory management service
  - ...and more

## Available Commands

### Core Commands

- `yarn dev` - Start all services in development mode
- `yarn build` - Build all packages and applications
- `yarn lint` - Run linting across the entire codebase
- `yarn test` - Run all tests

### Testing

- `yarn test:unit` - Run unit tests
- `yarn test:integration` - Run integration tests
- `yarn test:e2e` - Run end-to-end tests

### Database

- `yarn prisma:seed` - Seed the database with initial data
- `yarn prisma generate` - Generate Prisma client based on schema
- `yarn prisma migrate dev` - Create and apply new migrations
- `yarn prisma studio` - Open Prisma Studio to manage data

### Version Management

- `yarn changeset` - Create a new changeset for release
- `yarn version-packages` - Update package versions based on changesets
- `yarn release` - Build and publish packages

## Development Workflow

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Add tests for your changes
4. Run linting and testing to ensure everything works
5. If you've made changes to packages that should be published, create a changeset
6. Create a pull request
7. Wait for CI checks to pass
8. Get code review and address feedback
9. Merge to main when approved

## Troubleshooting

### Database Connection Issues

If you have trouble connecting to the database, check your `.env` file for correct connection settings.

### Port Conflicts

If you have port conflicts, check that no other services are running on the required ports. You can modify port mappings in `docker-compose.yml`.

### Yarn Installation Problems

If you encounter issues with Yarn dependencies, try clearing the cache:

```bash
yarn cache clean
```

## Additional Resources

- [Architecture Documentation](./architecture.md)
- [Contribution Guidelines](./contributing.md)
- [Deployment Instructions](./deployment.md)
- [Testing Strategy](./testing.md)
- [Versioning Guide](./versioning.md) 