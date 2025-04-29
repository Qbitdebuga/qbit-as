# Qbit Accounting System Master Document

## 1. Project Overview

Qbit Accounting System is a full-stack, microservices-based accounting solution designed for scalability, security, and maintainability. This document outlines the project structure, implementation steps, integration approaches, and enhancement plans.

## 2. Design Principles

1. **Service Independence**: Each service owns and manages its own data
2. **Eventual Consistency**: Event-driven architecture for cross-service data synchronization
3. **API-First Communication**: Services communicate via well-defined APIs
4. **Security**: Proper authentication and authorization across all services
5. **Observability**: Comprehensive logging and monitoring for troubleshooting
6. **Scalability**: Design for horizontal scaling of individual services
7. **Maintainability**: Modularized packages, shared contracts (types/api/errors)

## 3. Project Setup and Infrastructure

- [x] **Initialize monorepo project structure**
  - Set up Turborepo with initial package configurations, root-level configs (ESLint, TypeScript, Git)
  - **Files**: `package.json`, `turbo.json`, `.gitignore`, `.eslintrc.js`, `tsconfig.json`, `README.md`
  - **Instructions**: Run `yarn install` to install dependencies

- [x] **Configure shared packages and types**
  - Create shared packages for common types, UI components, and API client
  - **Files**: Structure under `packages/shared-types/`, `packages/ui-components/`, `packages/api-client/`

- [x] **Set up Next.js web application**
  - Initialize Next.js web application with Tailwind CSS and shadcn/ui
  - **Files**: Structure under `apps/web/`
  - **Instructions**: Run `cd apps/web && yarn install` to install Next.js dependencies

- [x] **Set up NestJS API gateway service**
  - Create API gateway service with NestJS
  - **Files**: Structure under `services/api-gateway/`
  - **Instructions**: Run `cd services/api-gateway && yarn install` to install NestJS dependencies

- [x] **Configure authentication service**
  - Create authentication service with user management and JWT authentication
  - **Files**: Structure under `services/auth/`
  - **Instructions**: Run `cd services/auth && yarn install` to install dependencies

- [x] **Set up PostgreSQL database and Prisma ORM**
  - Configure PostgreSQL database connection and Prisma ORM for data access
  - **Files**: Prisma schema and migrations, service modules
  - **Instructions**: Run `npx prisma generate` and `npx prisma migrate dev` to initialize the database

- [x] **Configure CI/CD with GitHub Actions**
  - Set up continuous integration and deployment pipelines
  - **Files**: GitHub workflows and Dependabot configuration

- [x] **Docker and Kubernetes configuration**
  - Set up Docker containers and Kubernetes manifests for all services
  - **Files**: Docker Compose, Dockerfiles, Kubernetes configurations
  - **Instructions**: Install Docker, Kubernetes CLI tools, and Kustomize

## 4. Authentication and User Management

- [x] **Implement user management**
  - Create user CRUD operations and role management
  - **Files**: DTOs, services, controllers, entities for users and roles

- [x] **Implement JWT authentication and role-based access control**
  - Set up JWT authentication, refresh tokens, and role-based guards
  - **Files**: Auth-related implementations including guards, strategies, decorators

- [x] **Create authentication client for frontend**
  - Implement authentication client in the API client package
  - **Files**: Auth client implementations, token storage utility

- [x] **Implement frontend authentication UI**
  - Create login, register, and password reset pages with form validation
  - **Files**: Auth-related pages and components

- [x] **Set up protected routes and auth context**
  - Implement authentication context and protected route components
  - **Files**: Auth context, middleware, protected route components

## 5. Microservices Integration and Communication

### 5.1 Infrastructure

- [x] **Configure Message Broker**
  - Add RabbitMQ service to enable event-driven communication between microservices
  - **Files**: Docker Compose configuration
  - **Instructions**: Run `docker-compose up -d rabbitmq`

- [x] **Set Up Service Discovery**
  - Add Consul service for service discovery
  - **Files**: Docker Compose configuration
  - **Instructions**: Run `docker-compose up -d consul`

- [x] **Create Development Environment Script**
  - Create scripts for setting up the development environment
  - **Files**: Setup scripts for different operating systems
  - **Instructions**: Run the appropriate script for your OS

### 5.2 Auth Service Integration

- [x] **Add Messaging Dependencies to Auth Service**
  - Add RabbitMQ client and microservices support
  - **Files**: Auth service package.json, environment files
  - **Instructions**: Run `cd services/auth && yarn install`

- [x] **Create Events Module for Auth Service**
  - Implement the Events Module for publishing and consuming events
  - **Files**: Events module, user publisher, configuration

- [x] **Implement User Entity Events**
  - Extend the User service to publish events when users are created, updated, or deleted
  - **Files**: User service and module updates

- [x] **Implement Service-to-Service Authentication**
  - Create service token generation and validation for secure service communication
  - **Files**: Service token services, auth guards
  - **Instructions**: Add SERVICE_JWT_SECRET environment variable

### 5.3 General Ledger Integration

- [x] **Add Messaging Dependencies to General Ledger Service**
  - Add RabbitMQ client and microservices support
  - **Files**: Package configuration, environment settings
  - **Instructions**: Run `cd services/general-ledger && yarn install`

- [x] **Create Events Module for General Ledger Service**
  - Implement the Events Module
  - **Files**: Events module, publishers, configuration

- [x] **Add User Event Consumer**
  - Create a consumer for user events from the Auth Service
  - **Files**: User events consumer, registration

- [x] **Implement Account Entity Events**
  - Extend the Account service to publish events
  - **Files**: Account service and module modifications

- [x] **Implement Journal Entry Entity Events**
  - Extend the Journal Entry service to publish events
  - **Files**: Journal entries service and module modifications

### 5.4 API Gateway Enhancement

- [x] **Add Service Client Dependencies to API Gateway**
  - Add dependencies for service communication
  - **Files**: Package configuration, environment settings
  - **Instructions**: Run `cd services/api-gateway && yarn install`

- [x] **Implement Service Clients in API Gateway**
  - Create client services for communication with other services
  - **Files**: Service clients, clients module, app module updates

- [x] **Create Aggregated Endpoints in API Gateway**
  - Implement endpoints that aggregate data from multiple services
  - **Files**: Aggregation controller, service, module

### 5.5 Shared API Client Package

- [x] **Create Service Interfaces in Shared Types**
  - Define shared interfaces for service communication
  - **Files**: Service interfaces and exports

- [x] **Implement Auth Client in API Client Package**
  - Create an Auth client with service token support
  - **Files**: Auth client updates, service-to-service auth client

- [x] **Implement General Ledger Client in API Client Package**
  - Create client implementations for General Ledger service
  - **Files**: General Ledger clients, exports

### 5.6 Cross-Service Data Consistency

- [x] **Create Data Validation Utilities**
  - Implement utilities for cross-service data validation
  - **Files**: Entity validation utilities, exports

- [x] **Implement Transaction Coordination in General Ledger**
  - Create saga pattern implementation for complex operations
  - **Files**: Sagas, journal entry integration

### 5.7 Inventory Service Integration

- [x] **Add Messaging Dependencies to Inventory Service**
  - Add RabbitMQ client and microservices support
  - **Files**: Package configuration, environment settings
  - **Instructions**: Run `cd services/inventory && yarn install`

- [x] **Create Events Module for Inventory Service**
  - Implement the Events Module
  - **Files**: Events module, publishers, configuration

- [x] **Add User Event Consumer**
  - Create a consumer for user events
  - **Files**: User events consumer, registration

- [x] **Implement Product/Warehouse/Transaction Entity Events**
  - Extend services to publish events when entities are modified
  - **Files**: Service and module modifications

- [x] **Implement General Ledger Event Consumer**
  - Create a consumer for account events
  - **Files**: Account events consumer, registration

- [x] **Add Inventory Service Client to API Gateway**
  - Create client service for Inventory Service
  - **Files**: Inventory service client, clients module update

### 5.8 Frontend Integration

- [x] **Create API Hook for Cross-Service Data**
  - Implement a React hook for fetching aggregated data
  - **Files**: Hook implementation, API context updates

- [x] **Implement Dashboard Overview Component**
  - Create a dashboard component with multi-service data
  - **Files**: Overview component, dashboard page

- [x] **Create Consolidated Report Component**
  - Implement a component for consolidated reports
  - **Files**: Report component, reports page

### 5.9 Monitoring and Observability

- [x] **Set Up ELK Stack for Logging**
  - Add ELK stack for centralized logging
  - **Files**: Docker Compose configuration
  - **Instructions**: Run `docker-compose up -d elasticsearch logstash kibana`

- [x] **Implement Logging in Services**
  - Configure services to send logs to centralized system
  - **Files**: Logging configuration, main.ts updates
  - **Instructions**: Install logging dependencies

- [x] **Add Health Checks to Services**
  - Implement health checks for monitoring
  - **Files**: Health controllers, indicators, modules
  - **Instructions**: Install health check dependencies

- [x] **Create System Status Dashboard**
  - Implement a dashboard for monitoring system status
  - **Files**: Status dashboard component, hooks, page

## 6. Core Financial Modules

### 6.1 General Ledger

- [x] **Set up General Ledger microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/general-ledger && yarn install`

- [x] **Implement Chart of Accounts data model and API**
  - Create the Chart of Accounts module with CRUD operations
  - **Files**: Prisma schema updates, accounts module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Chart of Accounts UI components**
  - Implement the Chart of Accounts management interface
  - **Files**: Accounts pages, components, API client

- [x] **Implement Journal Entries data model and API**
  - Create the Journal Entries module with CRUD operations
  - **Files**: Schema updates, journal entries implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Journal Entries UI components**
  - Implement the Journal Entries management interface
  - **Files**: Journal entries pages, components, API client

- [x] **Implement Financial Reporting API**
  - Create financial statement generation APIs
  - **Files**: Financial statements module, generators

- [x] **Create Financial Reporting UI**
  - Implement financial statement viewing and exporting
  - **Files**: Reports pages, components, utilities

### 6.2 Accounts Receivable

- [x] **Set up Accounts Receivable microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/accounts-receivable && yarn install`

- [x] **Implement Customer data model and API**
  - Create the Customer module with CRUD operations
  - **Files**: Schema updates, customer module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Customer management UI**
  - Implement the Customer management interface
  - **Files**: Customer pages, components, API client

- [x] **Implement Invoice data model and API**
  - Create the Invoice module with CRUD operations
  - **Files**: Schema updates, invoice module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Invoice management UI**
  - Implement the Invoice management interface
  - **Files**: Invoice pages, components, API client

- [x] **Implement Payment processing model and API**
  - Create the Payment module with payment application logic
  - **Files**: Schema updates, payment module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Payment management UI**
  - Implement the Payment management interface
  - **Files**: Payment pages, components, API client

### 6.3 Accounts Payable

- [x] **Set up Accounts Payable microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/accounts-payable && yarn install`

- [x] **Implement Vendor data model and API**
  - Create the Vendor module with CRUD operations
  - **Files**: Schema updates, vendor module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Vendor management UI**
  - Implement the Vendor management interface
  - **Files**: Vendor pages, components, API client

- [x] **Implement Bill data model and API**
  - Create the Bill module with CRUD operations
  - **Files**: Schema updates, bill module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Bill management UI**
  - Implement the Bill management interface
  - **Files**: Bill pages, components, API client

- [x] **Implement Vendor Payment data model and API**
  - Create the Vendor Payment module
  - **Files**: Schema updates, payment module implementation
  - **Instructions**: Run migration after schema update

### 6.4 Inventory Management

- [x] **Set up Inventory Management microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/inventory && yarn install`

- [x] **Implement Product data model and API**
  - Create the Products module with CRUD operations
  - **Files**: Schema updates, products module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Product Management UI**
  - Implement the Product management interface
  - **Files**: Product pages, components, API client

- [x] **Implement Warehouse data model and API**
  - Create the Warehouses module with CRUD operations
  - **Files**: Schema updates, warehouses module implementation
  - **Instructions**: Run migration after schema update

- [x] **Implement Inventory Transaction data model and API**
  - Create the Inventory Transaction module
  - **Files**: Schema updates, transactions module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Inventory Stock management UI**
  - Implement the interface for managing inventory stock
  - **Files**: Inventory pages, components, API client

### 6.5 Fixed Assets

- [x] **Set up Fixed Assets microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/fixed-assets && yarn install`

- [x] **Implement Asset data model and API**
  - Create the Asset module with CRUD operations
  - **Files**: Schema updates, assets module implementation
  - **Instructions**: Run migration after schema update

- [x] **Implement Depreciation data model and API**
  - Create the Depreciation module for asset depreciation calculations
  - **Files**: Schema updates, depreciation module implementation
  - **Instructions**: Run migration after schema update

- [x] **Create Fixed Assets management UI**
  - Implement the interface for managing fixed assets
  - **Files**: Assets pages, components, API client

### 6.6 Banking & Reconciliation

- [x] **Set up Banking microservice**
  - Create the service with basic structure
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/banking && yarn install`

- [x] **Implement Bank Account data model and API**
  - Create the Bank Account module with CRUD operations
  - **Files**: Schema updates, bank accounts module implementation
  - **Instructions**: Run migration after schema update

### 6.7 Reporting Service

- [x] **Create Reporting Service Structure**
  - Set up the basic structure for the Reporting microservice
  - **Files**: Service configuration, structure
  - **Instructions**: Run `cd services/reporting && yarn install`

- [x] **Add Reporting Service to Docker Compose**
  - Add reporting service configuration
  - **Files**: Docker Compose, initialization scripts
  - **Instructions**: Run `docker-compose up -d reporting`

- [x] **Create Reporting Database Schema**
  - Create a schema for the reporting database
  - **Files**: Prisma schema, SQL scripts
  - **Instructions**: Run the SQL script

- [x] **Implement Service Clients in Reporting Service**
  - Create client services for communication
  - **Files**: Service clients, clients module

- [x] **Implement Financial Reporting Service**
  - Create service for generating consolidated reports
  - **Files**: Reporting service, controller, module

## 7. API Client and Frontend Enhancements

- [x] **Refactor API clients to use ApiClientBase**
  - Update API client classes for better code reuse and consistency
  - **Files**: Base class implementation, client updates

- [x] **Create System Status Dashboard**
  - Implement the System Status Dashboard
  - **Files**: Dashboard page, component, API client

## 8. Enhancement Plan

### 8.1 Stage 1: Security Foundations

- [x] **Centralized Authentication Service**
  - Using existing auth service
  - JWT verification across all services

- [x] **Secure Token Handling**
  - Cookie-based auth in Next.js
  - CSRF protection

- [x] **Secrets Vault Integration**
  - Kubernetes Secrets configuration

### 8.2 Stage 2: Structural Improvements

- [x] **Refactor shared types package**
  - Create dedicated package for types and interfaces
  - Add models, DTOs, and response types

- [x] **Create standardized error package**
  - Implement shared error handling
  - Add exceptions, filters, and interceptors

- [x] **Create API client package**
  - Develop centralized API clients
  - Improve TypeScript interfaces

- [x] **Create utilities package**
  - Add date, currency formatters
  - Add validators and crypto utilities

- [x] **Set up NATS messaging infrastructure**
  - Configure NATS for event-driven communication
  - Create events package with publishers/listeners

- [x] **Implement event publishers and listeners**
  - Create events for users, accounts, transactions
  - Implement publishers and listeners

- [x] **Integrate NestJS global exception filters**
  - Add filters to all microservices
  - Standardize error handling

### 8.3 Stage 3: Developer Experience and Observability

- [x] **Optimize Dockerfiles with multi-stage builds**
  - Refactor Dockerfiles for smaller images

- [x] **Add Kubernetes health checks**
  - Implement readiness and liveness probes

- [x] **Set up centralized logging with Winston**
  - Implement centralized logging

- [x] **Implement OpenTelemetry for distributed tracing**
  - Add distributed tracing
  - Include Jaeger for visualization

- [x] **Implement Zod validation for frontend**
  - Add validation to frontend forms

- [x] **Enhance backend validation with class-validator**
  - Enforce DTO validation across services

### 8.4 Stage 4: Production Readiness (Planned)

- [x] **Set up GitHub Actions CI workflow**
  - Create workflow for continuous integration

- [ ] **Set up CD workflow for Kubernetes deployment**
  - Implement continuous deployment

- [ ] **Implement semantic versioning and Changesets**
  - Set up versioning with Changesets

- [ ] **Optimize Turborepo caching**
  - Configure Turborepo for optimal caching

- [ ] **Create comprehensive developer documentation**
  - Create detailed documentation for developers

## 9. Dependency Update Plan

The project follows a structured approach to dependency updates through discrete PRs:

### 9.1 Completed Updates

- [x] **Critical Security Patches**
  - Updated axios, undici, openssl-nodejs

- [x] **Database and ORM Updates**
  - Updated Prisma client and related tools

- [x] **Frontend Library Updates**
  - Updated tailwindcss while maintaining compatibility with radix, react-hook-form, and zod

- [x] **Development Tooling Standardization**
  - Standardized typescript, eslint, jest, and prettier

- [x] **Deprecated Package Replacements**
  - Replaced libsodium-wrappers with node:crypto

- [x] **Node.js Runtime Update**
  - Updated to Node.js 20.18.1 LTS

### 9.2 Pending Updates

- [ ] **Backend Framework Updates**
  - Update NestJS ecosystem and backend dependencies

### 9.3 Testing Strategy

1. **Automated Tests**: Run full test suite
2. **Integration Tests**: Verify service communication
3. **Specific Testing**:
   - Security PRs: Vulnerability scans
   - UI PRs: Visual regression tests
   - Database PRs: Migration and query tests
4. **Deployment Testing**:
   - Deploy to staging environment
   - Run smoke tests

## 10. Consistency Rules

1. **Naming Conventions**:
   - Service names: lowercase, hyphenated (e.g., `general-ledger`)
   - Events: dot notation, verb.noun format (e.g., `account.created`)
   - Database tables: snake_case, plural (e.g., `journal_entries`)

2. **API Endpoints**:
   - RESTful design: `/resources/{id}/sub-resources`
   - Version prefixes: `/api/v1/resources`
   - Consistent response format

3. **Event Format**:
   - Include: `serviceSource`, `entityType`, `timestamp`
   - JSON-serializable payloads
   - Entity ID in all events

4. **Error Handling**:
   - Standardized error responses
   - Error codes, messages, and details
   - Logging with correlation IDs

5. **Documentation**:
   - OpenAPI documentation for all services
   - Document events produced and consumed
   - Sequence diagrams for complex operations

6. **Testing**:
   - Unit tests for business logic
   - Integration tests for service boundaries
   - End-to-end tests for critical flows 