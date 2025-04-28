# Microservices Integration Plan for Qbit Accounting System

This document outlines the implementation plan for connecting the various microservices in the Qbit accounting system. The plan focuses on establishing proper communication between services while maintaining data integrity across multiple databases.

## Design Principles

1. **Service Independence**: Each service owns and manages its own data
2. **Eventual Consistency**: Use event-driven architecture for cross-service data synchronization
3. **API-First Communication**: Services communicate via well-defined APIs
4. **Security**: Ensure proper authentication and authorization for all cross-service communication
5. **Observability**: Implement comprehensive logging and monitoring for troubleshooting
6. **Scalability**: Design for horizontal scaling of individual services

# Implementation Plan

## Infrastructure Setup
- [x] Step 1: Configure Docker Compose for Message Broker
  - **Task**: Add RabbitMQ service to the Docker Compose configuration to enable event-driven communication between microservices
  - **Files**:
    - `docker-compose.yml`: Add RabbitMQ service configuration with proper networking, ports, and volume mounts
  - **User Instructions**: Run `docker-compose up -d rabbitmq` to start the RabbitMQ service after updating the docker-compose.yml file

- [x] Step 2: Set Up Service Discovery with Consul
  - **Task**: Add Consul service to Docker Compose for service discovery
  - **Files**:
    - `docker-compose.yml`: Add Consul service configuration with proper networking and ports
  - **User Instructions**: Run `docker-compose up -d consul` to start the Consul service

- [x] Step 3: Create Development Environment Script
  - **Task**: Create a script to set up the development environment with all necessary services
  - **Files**:
    - `scripts/setup-dev-env.sh`: Script to start all required services and initialize configurations
    - `scripts/setup-dev-env.ps1`: Windows PowerShell version of the setup script
  - **User Instructions**: Run the appropriate script for your OS to set up the development environment

## Auth Service Enhancement
- [x] Step 4: Add Messaging Dependencies to Auth Service
  - **Task**: Add RabbitMQ client and microservices support to the Auth Service
  - **Files**:
    - `services/auth/package.json`: Add NestJS microservices and RabbitMQ dependencies
    - `services/auth/.env`: Add RabbitMQ connection settings
    - `services/auth/.env.example`: Update with new environment variables
  - **User Instructions**: Run `cd services/auth && yarn install` to install the new dependencies

- [x] Step 5: Create Events Module for Auth Service
  - **Task**: Implement the Events Module for the Auth Service to publish and consume events
  - **Files**:
    - `services/auth/src/events/events.module.ts`: Create Events Module
    - `services/auth/src/events/publishers/user-publisher.ts`: Implement User events publisher
    - `services/auth/src/app.module.ts`: Import and configure Events Module
  - **Step Dependencies**: Step 4

- [x] Step 6: Implement User Entity Events
  - **Task**: Extend the User service to publish events when users are created, updated, or deleted
  - **Files**:
    - `services/auth/src/user/user.service.ts`: Modify service to publish events
    - `services/auth/src/user/user.module.ts`: Import Events Module
  - **Step Dependencies**: Step 5

- [x] Step 7: Implement Service-to-Service Authentication
  - **Task**: Create a service token generator and validator for secure service-to-service communication
  - **Files**:
    - `services/auth/src/auth/services/service-token.service.ts`: Create service token generation service
    - `services/auth/src/auth/guards/service-auth.guard.ts`: Implement guard for service authentication
    - `services/auth/src/auth/auth.module.ts`: Update to export new services
    - `services/auth/.env`: Add SERVICE_JWT_SECRET variable
  - **Step Dependencies**: Step 4
  - **User Instructions**: Add the SERVICE_JWT_SECRET environment variable to your .env file with a secure value

## General Ledger Service Enhancement
- [x] Step 8: Add Messaging Dependencies to General Ledger Service
  - **Task**: Add RabbitMQ client and microservices support to the General Ledger Service
  - **Files**:
    - `services/general-ledger/package.json`: Add NestJS microservices and RabbitMQ dependencies
    - `services/general-ledger/.env`: Add RabbitMQ connection settings
    - `services/general-ledger/.env.example`: Update with new environment variables
  - **User Instructions**: Run `cd services/general-ledger && yarn install` to install the new dependencies

- [x] Step 9: Create Events Module for General Ledger Service
  - **Task**: Implement the Events Module for the General Ledger Service
  - **Files**:
    - `services/general-ledger/src/events/events.module.ts`: Create Events Module
    - `services/general-ledger/src/events/publishers/account-publisher.ts`: Implement Account events publisher
    - `services/general-ledger/src/events/publishers/journal-entry-publisher.ts`: Implement Journal Entry events publisher
    - `services/general-ledger/src/app.module.ts`: Import and configure Events Module
  - **Step Dependencies**: Step 8

- [x] Step 10: Add User Event Consumer
  - **Task**: Create a consumer for user events from the Auth Service
  - **Files**:
    - `services/general-ledger/src/events/consumers/user-consumer.ts`: Create User events consumer
    - `services/general-ledger/src/events/events.module.ts`: Register the consumer
  - **Step Dependencies**: Step 9

- [x] Step 11: Implement Account Entity Events
  - **Task**: Extend the Account service to publish events when accounts are created, updated, or deleted
  - **Files**:
    - `services/general-ledger/src/accounts/accounts.service.ts`: Modify service to publish events
    - `services/general-ledger/src/accounts/accounts.module.ts`: Import Events Module
  - **Step Dependencies**: Step 9

- [x] Step 12: Implement Journal Entry Entity Events
  - **Task**: Extend the Journal Entry service to publish events for journal entries
  - **Files**:
    - `services/general-ledger/src/journal-entries/journal-entries.service.ts`: Modify service to publish events
    - `services/general-ledger/src/journal-entries/journal-entries.module.ts`: Import Events Module
  - **Step Dependencies**: Step 9

## API Gateway Enhancement
- [x] Step 13: Add Service Client Dependencies to API Gateway
  - **Task**: Add required dependencies for service communication to the API Gateway
  - **Files**:
    - `services/api-gateway/package.json`: Add NestJS microservices and HTTP client dependencies
    - `services/api-gateway/.env`: Add service URLs and connection settings
    - `services/api-gateway/.env.example`: Update with new environment variables
  - **User Instructions**: Run `cd services/api-gateway && yarn install` to install the new dependencies

- [x] Step 14: Implement Service Clients in API Gateway
  - **Task**: Create client services to communicate with the Auth and General Ledger services
  - **Files**:
    - `services/api-gateway/src/clients/auth-client.service.ts`: Create Auth service client
    - `services/api-gateway/src/clients/general-ledger-client.service.ts`: Create General Ledger service client
    - `services/api-gateway/src/clients/clients.module.ts`: Create and configure clients module
    - `services/api-gateway/src/app.module.ts`: Import Clients Module
  - **Step Dependencies**: Step 13

- [x] Step 15: Create Aggregated Endpoints in API Gateway
  - **Task**: Implement endpoints that aggregate data from multiple services
  - **Files**:
    - `services/api-gateway/src/aggregation/aggregation.controller.ts`: Create controller with aggregated endpoints
    - `services/api-gateway/src/aggregation/aggregation.service.ts`: Implement aggregation logic
    - `services/api-gateway/src/aggregation/aggregation.module.ts`: Configure Aggregation Module
    - `services/api-gateway/src/app.module.ts`: Import Aggregation Module
  - **Step Dependencies**: Step 14

## Shared API Client Package
- [x] Step 16: Create Service Interfaces in Shared Types
  - **Task**: Define shared interfaces for service communication
  - **Files**:
    - `packages/shared-types/src/interfaces/auth-service.interface.ts`: Define Auth Service interface
    - `packages/shared-types/src/interfaces/general-ledger-service.interface.ts`: Define General Ledger Service interface
    - `packages/shared-types/src/interfaces/index.ts`: Export the interfaces
    - `packages/shared-types/src/index.ts`: Update main export

- [x] Step 17: Implement Auth Client in API Client Package
  - **Task**: Create an Auth client in the shared API client package
  - **Files**:
    - `packages/api-client/src/auth/auth-client.ts`: Enhance existing auth client with service token support
    - `packages/api-client/src/auth/service-auth-client.ts`: Implement service-to-service auth client
    - `packages/api-client/src/auth/index.ts`: Update exports
  - **Step Dependencies**: Step 16

- [x] Step 18: Implement General Ledger Client in API Client Package
  - **Task**: Create a General Ledger client in the shared API client package
  - **Files**:
    - `packages/api-client/src/general-ledger/general-ledger-client.ts`: Implement GL client
    - `packages/api-client/src/general-ledger/accounts-client.ts`: Implement Accounts client
    - `packages/api-client/src/general-ledger/journal-entries-client.ts`: Implement Journal Entries client
    - `packages/api-client/src/general-ledger/index.ts`: Export the clients
    - `packages/api-client/src/index.ts`: Update main export
  - **Step Dependencies**: Step 16

## Cross-Service Data Consistency
- [x] Step 19: Create Data Validation Utilities
  - **Task**: Implement utilities for cross-service data validation
  - **Files**:
    - `packages/shared-types/src/validation/entity-validator.ts`: Create utility for entity validation
    - `packages/shared-types/src/validation/index.ts`: Export validation utilities
    - `packages/shared-types/src/index.ts`: Update main export
  - **Step Dependencies**: Step 16

- [x] Step 20: Implement Transaction Coordination in General Ledger
  - **Task**: Create saga pattern implementation for complex operations in General Ledger
  - **Files**:
    - `services/general-ledger/src/sagas/journal-entry-creation.saga.ts`: Implement saga for journal entry creation
    - `services/general-ledger/src/sagas/sagas.module.ts`: Configure Sagas Module
    - `services/general-ledger/src/journal-entries/journal-entries.service.ts`: Integrate saga
    - `services/general-ledger/src/app.module.ts`: Import Sagas Module
  - **Step Dependencies**: Step 12, Step 19

## Reporting Service
- [x] Step 21: Create Reporting Service Structure
  - **Task**: Set up the basic structure for the Reporting microservice
  - **Files**:
    - `services/reporting/package.json`: Create package configuration
    - `services/reporting/tsconfig.json`: TypeScript configuration
    - `services/reporting/src/main.ts`: Entry point
    - `services/reporting/src/app.module.ts`: Root module
    - `services/reporting/src/config/config.module.ts`: Configuration module
    - `services/reporting/src/prisma/prisma.module.ts`: Prisma module
    - `services/reporting/src/prisma/prisma.service.ts`: Prisma service
    - `services/reporting/Dockerfile`: Docker configuration
    - `services/reporting/prisma/schema.prisma`: Prisma schema definition
    - `services/reporting/.env.example`: Environment variables example
  - **User Instructions**: Run `cd services/reporting && yarn install` to install dependencies

- [x] Step 22: Add Reporting Service to Docker Compose
  - **Task**: Add reporting service configuration to Docker Compose
  - **Files**:
    - `docker-compose.yml`: Add Reporting service configuration
    - `scripts/create-reporting-schema.sql`: Create SQL script for database initialization
    - `scripts/create-reporting-views.sql`: Create SQL script for reporting views
    - `services/reporting/scripts/init-db.sh`: Script to initialize the database
    - `services/reporting/scripts/wait-for-it.sh`: Script to wait for services to become available
  - **Step Dependencies**: Step 21
  - **User Instructions**: Run `docker-compose up -d reporting` to start the reporting service

- [x] Step 23: Create Reporting Database Schema
  - **Task**: Create a schema for the reporting database
  - **Files**:
    - `services/reporting/prisma/schema.prisma`: Create Prisma schema
    - `services/reporting/prisma/migrations/.gitkeep`: Create placeholder for migrations
    - `scripts/create-reporting-schema.sql`: Create SQL script for reporting views
  - **Step Dependencies**: Step 21
  - **User Instructions**: Run the SQL script: `psql -U postgres -d qbit -f scripts/create-reporting-schema.sql`

- [x] Step 24: Implement Service Clients in Reporting Service
  - **Task**: Create client services to communicate with other microservices
  - **Files**:
    - `services/reporting/src/clients/auth-client.ts`: Create Auth client
    - `services/reporting/src/clients/general-ledger-client.ts`: Create General Ledger client
    - `services/reporting/src/clients/clients.module.ts`: Configure Clients module
    - `services/reporting/src/app.module.ts`: Import Clients module
  - **Step Dependencies**: Step 21, Step 7

- [x] Step 25: Implement Financial Reporting Service
  - **Task**: Create a service for generating consolidated financial reports
  - **Files**:
    - `services/reporting/src/financial/financial-reporting.service.ts`: Implement service
    - `services/reporting/src/financial/financial-reporting.controller.ts`: Create controller
    - `services/reporting/src/financial/financial-reporting.module.ts`: Configure module
    - `services/reporting/src/financial/dto/report-request.dto.ts`: Create DTO for report requests
    - `services/reporting/src/app.module.ts`: Import Financial Reporting module
  - **Step Dependencies**: Step 24

## Inventory Service Enhancement
- [x] Step 32: Add Messaging Dependencies to Inventory Service
  - **Task**: Add RabbitMQ client and microservices support to the Inventory Service
  - **Files**:
    - `services/inventory/package.json`: Add NestJS microservices and RabbitMQ dependencies
    - `services/inventory/.env`: Add RabbitMQ connection settings
    - `services/inventory/.env.example`: Update with new environment variables
  - **User Instructions**: Run `cd services/inventory && yarn install` to install the new dependencies

- [x] Step 33: Create Events Module for Inventory Service
  - **Task**: Implement the Events Module for the Inventory Service
  - **Files**:
    - `services/inventory/src/events/events.module.ts`: Create Events Module
    - `services/inventory/src/events/publishers/product-publisher.ts`: Implement Product events publisher
    - `services/inventory/src/events/publishers/warehouse-publisher.ts`: Implement Warehouse events publisher
    - `services/inventory/src/events/publishers/transaction-publisher.ts`: Implement Transaction events publisher
    - `services/inventory/src/app.module.ts`: Import and configure Events Module
  - **Step Dependencies**: Step 32

- [x] Step 34: Add User Event Consumer
  - **Task**: Create a consumer for user events from the Auth Service
  - **Files**:
    - `services/inventory/src/events/consumers/user-consumer.ts`: Create User events consumer
    - `services/inventory/src/events/events.module.ts`: Register the consumer
  - **Step Dependencies**: Step 33

- [x] Step 35: Implement Product Entity Events
  - **Task**: Extend the Product service to publish events when products are created, updated, or deleted
  - **Files**:
    - `services/inventory/src/products/products.service.ts`: Modify service to publish events
    - `services/inventory/src/products/products.module.ts`: Import Events Module
  - **Step Dependencies**: Step 33

- [x] Step 36: Implement Warehouse Entity Events
  - **Task**: Extend the Warehouse service to publish events when warehouses are created, updated, or deleted
  - **Files**:
    - `services/inventory/src/warehouses/warehouses.service.ts`: Modify service to publish events
    - `services/inventory/src/warehouses/warehouses.module.ts`: Import Events Module
  - **Step Dependencies**: Step 33

- [x] Step 37: Implement Transaction Entity Events
  - **Task**: Extend the Transaction service to publish events when inventory transactions are created, processed, or cancelled
  - **Files**:
    - `services/inventory/src/transactions/transactions.service.ts`: Modify service to publish events
    - `services/inventory/src/transactions/transactions.module.ts`: Import Events Module
  - **Step Dependencies**: Step 33

- [x] Step 38: Implement General Ledger Event Consumer
  - **Task**: Create a consumer for account events from the General Ledger Service
  - **Files**:
    - `services/inventory/src/events/consumers/account-consumer.ts`: Create Account events consumer
    - `services/inventory/src/events/events.module.ts`: Register the consumer
  - **Step Dependencies**: Step 33

## Frontend Integration
- [x] Step 26: Create API Hook for Cross-Service Data
  - **Task**: Implement a React hook for fetching aggregated data from multiple services
  - **Files**:
    - `apps/web/src/hooks/useAggregatedData.ts`: Create the hook
    - `apps/web/src/contexts/api-context.tsx`: Update API context if needed
  - **Step Dependencies**: Step 15

- [x] Step 27: Implement Dashboard Overview Component
  - **Task**: Create a dashboard component that displays data from multiple services
  - **Files**:
    - `apps/web/src/components/dashboard/FinancialOverview.tsx`: Create overview component
    - `apps/web/src/app/dashboard/page.tsx`: Update dashboard page
  - **Step Dependencies**: Step 26

- [x] Step 28: Create Consolidated Report Component
  - **Task**: Implement a component for displaying consolidated financial reports
  - **Files**:
    - `apps/web/src/components/reports/ConsolidatedReport.tsx`: Create the component
    - `apps/web/src/app/dashboard/reports/consolidated/page.tsx`: Create page for consolidated reports
  - **Step Dependencies**: Step 26

## Monitoring and Observability
- [x] Step 29: Set Up ELK Stack for Logging
  - **Task**: Add ELK stack to Docker Compose for centralized logging
  - **Files**:
    - `docker-compose.yml`: Add Elasticsearch, Logstash, and Kibana services
  - **User Instructions**: Run `docker-compose up -d elasticsearch logstash kibana` to start the ELK stack

- [x] Step 30: Implement Logging in Auth Service
  - **Task**: Configure the Auth Service to send logs to the centralized logging system
  - **Files**:
    - `services/auth/package.json`: Add logging dependencies
    - `services/auth/src/main.ts`: Configure logging
    - `services/auth/src/config/logging.config.ts`: Create logging configuration
    - `services/auth/tsconfig.json`: Update TypeScript configuration for proper module resolution
  - **Step Dependencies**: Step 29
  - **User Instructions**: Run `cd services/auth && yarn run install-logging` to install the logging dependencies

- [x] Step 31: Implement Logging in General Ledger Service
  - **Task**: Configure the General Ledger Service to send logs to the centralized logging system
  - **Files**:
    - `services/general-ledger/package.json`: Add logging dependencies
    - `services/general-ledger/src/main.ts`: Configure logging with fallback option
    - `services/general-ledger/src/config/logging.config.ts`: Create logging configuration
    - `services/general-ledger/src/config/configuration.ts`: Define configuration values
    - `services/general-ledger/tsconfig.json`: Update TypeScript configuration for proper module resolution
  - **Step Dependencies**: Step 29
  - **User Instructions**: 
    1. Add Winston packages to package.json manually:
       ```json
       "nest-winston": "^1.9.4",
       "winston": "^3.10.0",
       "winston-transport": "^4.5.0"
       ```
    2. **Note**: The General Ledger service has several TypeScript errors unrelated to logging. The logging implementation includes a fallback logger that will be used if Winston is not available, ensuring the service can still run with basic logging capabilities.
    3. To manually verify the logging configuration:
       - Check that `services/general-ledger/src/config/logging.config.ts` is correctly implemented
       - Verify that `services/general-ledger/src/main.ts` includes the fallback logger
       - Confirm that the environment variables are set in `.env` file

- [x] Step 32: Add Health Check to Auth Service
  - **Task**: Implement health checks in the Auth Service
  - **Files**:
    - `services/auth/package.json`: Add Terminus health check dependency
    - `services/auth/src/health/health.controller.ts`: Create health controller
    - `services/auth/src/health/prisma.health.ts`: Create Prisma health indicator
    - `services/auth/src/health/health.module.ts`: Configure Health module
    - `services/auth/src/app.module.ts`: Import Health module
  - **Step Dependencies**: Step 30
  - **User Instructions**: Run `cd services/auth && yarn run install-health-check` to install the health check dependencies

- [x] Step 33: Add Health Check to General Ledger Service
  - **Task**: Implement health checks in the General Ledger Service
  - **Files**:
    - `services/general-ledger/package.json`: Add Terminus health check dependency
    - `services/general-ledger/src/health/health.controller.ts`: Create health controller
    - `services/general-ledger/src/health/prisma.health.ts`: Create Prisma health indicator
    - `services/general-ledger/src/health/health.module.ts`: Configure Health module
    - `services/general-ledger/src/app.module.ts`: Import Health module
  - **Step Dependencies**: Step 31
  - **User Instructions**: Run `cd services/general-ledger && yarn add @nestjs/terminus` to install the health check dependency

- [x] Step 34: Create System Status Dashboard
  - **Task**: Implement a dashboard for monitoring the system status
  - **Files**:
    - `apps/web/src/components/admin/SystemStatus.tsx`: Create status dashboard component
    - `apps/web/src/app/dashboard/admin/system-status/page.tsx`: Create page for system status
    - `apps/web/src/hooks/useSystemStatus.ts`: Create hook for fetching system status
  - **Step Dependencies**: Step 32, Step 33

## Rules for Consistency

1. **Naming Conventions**:
   - Service names: lowercase, hyphenated (e.g., `general-ledger`)
   - Events: dot notation, verb.noun format (e.g., `account.created`)
   - Database tables: snake_case, plural (e.g., `journal_entries`)

2. **API Endpoints**:
   - RESTful design: `/resources/{id}/sub-resources`
   - Version prefixes: `/api/v1/resources`
   - Consistent response format

3. **Event Format**:
   - Every event must include: `serviceSource`, `entityType`, `timestamp`
   - Data payloads should be serializable to JSON
   - Include entity ID in all events

4. **Error Handling**:
   - Use standardized error responses across all services
   - Include error codes, messages, and details
   - Log all errors with correlation IDs

5. **Documentation**:
   - Every service must include OpenAPI documentation
   - Document all events produced and consumed
   - Maintain sequence diagrams for complex operations

6. **Testing**:
   - Unit tests for all business logic
   - Integration tests for service boundaries
   - End-to-end tests for critical flows

- [ ] Step 39: Add Inventory Service Client to API Gateway
  - **Task**: Create client service to communicate with the Inventory Service
  - **Files**:
    - `services/api-gateway/src/clients/inventory-client.service.ts`: Create Inventory service client
    - `services/api-gateway/src/clients/clients.module.ts`: Update clients module
  - **Step Dependencies**: Step 32, Step 14