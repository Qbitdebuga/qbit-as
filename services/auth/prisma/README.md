# Auth Service - Prisma Database Layer

## Overview

This directory contains the Prisma schema and database migration files for the Auth service.

## Schema

The Prisma schema (`schema.prisma`) defines:

- User entities with authentication information
- Roles and permissions for access control
- Audit logs for tracking authentication events

## Scripts

The following scripts are available for database management:

```bash
# Generate Prisma Client
yarn prisma:generate

# Run Database Migrations
yarn prisma:migrate:dev

# Seed the Database
yarn db:seed
```

## Development

- Use `yarn prisma:studio` to open Prisma Studio for database visualization
- Create new migrations: `yarn prisma:migrate:dev --name migration_name`

## Models

### User

```prisma
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  password    String
  firstName   String?
  lastName    String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  roleId      String?
  role        Role?     @relation(fields: [roleId], references: [id])
}
```

### Role

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  permissions String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
}
``` 