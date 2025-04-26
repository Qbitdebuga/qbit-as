# Qbit Accounting System

A full-stack accounting system built as a monorepo using Turborepo, Next.js, NestJS, and Prisma.

## Project Structure

- `apps/` - Frontend applications
  - `web/` - Next.js web application
- `packages/` - Shared packages
  - `shared-types/` - TypeScript types and interfaces
  - `ui-components/` - Reusable UI components
  - `api-client/` - API clients for backend services
- `services/` - Backend microservices
  - `api-gateway/` - API Gateway service
  - `auth/` - Authentication service
  - `general-ledger/` - General Ledger service
  - `accounts-receivable/` - Accounts Receivable service
  - `accounts-payable/` - Accounts Payable service
  - `inventory/` - Inventory Management service
  - `fixed-assets/` - Fixed Assets service
  - `banking/` - Banking service

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Docker (for development and deployment)
- PostgreSQL (for development and production)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-org/qbit-accounting.git
   cd qbit-accounting
   ```

2. Install dependencies
   ```
   yarn install
   ```

3. Start the development server
   ```
   yarn dev
   ```

## Development

Each package and app can be developed independently or together. Run the following commands from the root directory:

- `yarn build` - Build all packages and apps
- `yarn dev` - Start all development servers
- `yarn lint` - Lint all packages and apps

## License

[MIT](LICENSE)

## Recent Completions

### Step 41: Create Inventory Stock Management UI

We have successfully implemented the inventory stock management UI with the following components:

1. **API Client Integration**:
   - Created an inventory API client to interact with the inventory service
   - Implemented methods for fetching inventory levels, transactions, and warehouse data

2. **UI Components**:
   - StockLevelList: Displays inventory levels with filtering and sorting
   - TransactionList: Shows inventory transactions with actions like edit, view, process, and delete
   - TransactionForm: Allows creating and editing inventory transactions
   - WarehouseSelector: Component for selecting warehouses to filter inventory data

3. **Pages**:
   - Main inventory page showing stock levels across warehouses
   - Transactions list page for viewing and managing inventory movements
   - New transaction page for creating inventory transactions

These components provide a complete interface for managing inventory stock, tracking movements, and making inventory adjustments. The UI integrates with the previously built inventory transaction API and provides a user-friendly way to manage product stock levels across multiple warehouses.

### Microservices Integration Plan Completion

We have successfully completed all steps in the microservices integration plan, establishing a robust event-driven architecture connecting all services:

1. **Infrastructure Setup**:
   - Configured Docker Compose with RabbitMQ message broker
   - Set up service discovery with Consul
   - Created development environment scripts

2. **Auth Service Enhancements**:
   - Added messaging capabilities to the Auth Service
   - Implemented user entity events (user created, updated, deleted)
   - Created service-to-service authentication

3. **General Ledger Service Enhancements**:
   - Added event messaging support
   - Implemented account and journal entry entity events
   - Created transaction coordination for financial data integrity

4. **API Gateway Enhancements**:
   - Implemented service clients for all microservices
   - Created aggregated endpoints for cross-service data
   - Added proper authentication and authorization

5. **Cross-Service Data Consistency**:
   - Created shared API client packages
   - Implemented service interfaces in shared types
   - Added data validation utilities

6. **Reporting Service**:
   - Built a dedicated reporting service structure
   - Created service clients for data aggregation
   - Implemented financial reporting capabilities

7. **Inventory Service Integration**:
   - Added event messaging support
   - Implemented entity events for products, warehouses, and transactions
   - Created consumers for related service events

8. **Monitoring and Observability**:
   - Set up ELK stack for centralized logging
   - Implemented logging in all services
   - Added health checks throughout the system
   - Created a system status dashboard

The microservices now work together in a cohesive architecture, communicating through events while maintaining service independence, following the design principles of eventual consistency, API-first communication, security, observability, and scalability.

## Environment Variable Substitution

When deploying to Kubernetes, you need to properly substitute environment variables in the manifest files. We provide scripts to handle this:

### For Linux/Mac:
```bash
# Make the script executable
chmod +x scripts/substitute-env.sh

# Run with your Docker registry username
./scripts/substitute-env.sh yourusername

# Apply the processed manifests
kubectl apply -f processed-k8s/
```

### For Windows:
```powershell
# Run with your Docker registry username
.\scripts\substitute-env.ps1 yourusername

# Apply the processed manifests
kubectl apply -f processed-k8s/
```

This will replace `${DOCKER_REGISTRY}` with your actual Docker registry username in all Kubernetes manifests and save the processed files in the `processed-k8s` directory.

## CI/CD Pipeline

The GitHub Actions workflow will automatically handle environment variable substitution during deployment:

1. It replaces `${DOCKER_REGISTRY}` with the Docker Hub username stored in GitHub Secrets
2. Processes all Kubernetes manifests before applying them
3. Applies the processed manifests to the Kubernetes cluster

## Additional Information

## Database Migrations

The Qbit Accounting System uses Prisma ORM for database migrations across all microservices. Each service has its own database schema and migration history.

### Running Migrations Locally

We provide scripts to run migrations for all services:

#### For Linux/Mac:
```bash
# Make the script executable
chmod +x scripts/run-migrations.sh

# Run migrations for development environment
./scripts/run-migrations.sh

# Or for a specific environment
./scripts/run-migrations.sh production
```

#### For Windows:
```powershell
# Run migrations for development environment
.\scripts\run-migrations.ps1

# Or for a specific environment
.\scripts\run-migrations.ps1 -Environment production
```

### CI/CD Pipeline Migration Process

Our GitHub Actions workflow includes a dedicated job for database migrations:

1. The workflow first builds all services
2. Before deployment, it runs a separate job to handle database migrations
3. Migration job checks database status and then applies pending migrations
4. Only after successful migrations are the services deployed

This ensures database schema compatibility with the new service versions before deployment.

### Creating New Migrations

To create a new migration for a service:

```bash
# Navigate to the service directory
cd services/[service-name]

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

The migration will be added to the service's Prisma migration history and will be applied during the next deployment.

## Environment Variable Substitution

## Secrets Management

The Qbit Accounting System provides multiple approaches for managing secrets in Kubernetes:

### 1. GitHub Actions Workflow (CI/CD)

Our CI/CD pipeline creates Kubernetes secrets automatically during deployment:

- Secrets are generated from GitHub repository secrets
- All secrets are created in the dedicated `qbit` namespace
- The workflow uses `kubectl create secret` with the `--dry-run` flag to safely apply secrets

Required GitHub secrets:
- `POSTGRES_PASSWORD`: Password for PostgreSQL database
- `JWT_SECRET`: Secret for JWT token signing
- `SERVICE_JWT_SECRET`: Secret for service-to-service authentication
- `RABBITMQ_PASSWORD`: Password for RabbitMQ

### 2. Local Development

For local development, we provide scripts to create secrets:

```powershell
# PowerShell - Generate random secrets
.\scripts\create-secrets.ps1 -Namespace qbit -GenerateValues

# PowerShell - Use existing or prompt for secrets
.\scripts\create-secrets.ps1 -Namespace qbit
```

### 3. External Secrets Manager Integration

For production environments, we support using external secrets managers:

#### AWS Secrets Manager

```bash
# Install External Secrets Operator with AWS integration
./k8s/external-secrets/setup-external-secrets.sh aws
```

#### Azure Key Vault

```bash
# Install External Secrets Operator with Azure Key Vault integration
./k8s/external-secrets/setup-external-secrets.sh azure
```

### Required Secrets

These secrets are required for the system to function properly:

1. **postgres-secrets**
   - `POSTGRES_PASSWORD`: PostgreSQL admin password

2. **api-gateway-secrets**
   - `JWT_SECRET`: JWT token signing key
   - `SERVICE_JWT_SECRET`: Service-to-service auth token signing key
   - `RABBITMQ_PASSWORD`: RabbitMQ password

3. **auth-service-secrets**
   - `JWT_SECRET`: JWT token signing key
   - `SERVICE_JWT_SECRET`: Service-to-service auth token signing key
   - `DATABASE_PASSWORD`: Database password
   - `RABBITMQ_PASSWORD`: RabbitMQ password

4. **Service-specific secrets**
   - Each service has its own secrets with the pattern `{service-name}-secrets`
   - All service secrets include database passwords and auth tokens 