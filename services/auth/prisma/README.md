# Auth Service Prisma Setup

This directory contains the Prisma setup for the Auth microservice within the Qbit Accounting System.

## Files

- `schema.prisma`: Defines the database models and relationships for the auth service
- `seed.ts`: Seeds the database with initial roles and admin user
- `migrations/`: Contains database migration files

## Models

The Auth service has two main models:

1. **User** - Stores user account information
   - Fields: id, email, name, password, roles, createdAt, updatedAt
   - Users can have multiple roles (stored as string array)

2. **Role** - Defines user roles and their permissions
   - Fields: id, name, description, permissions, createdAt, updatedAt
   - Permissions are stored as string array of permission codes

## Setup

1. Create a `.env` file based on `.env.example`
2. Generate Prisma client: `npm run prisma:generate`
3. Run migrations: `npm run prisma:migrate:dev`
4. Seed the database: `npm run db:seed`

## Development

- Use `npm run prisma:studio` to open Prisma Studio for database visualization
- Create new migrations: `npm run prisma:migrate:dev -- --name migration_name`
- Reset the database: `npx prisma migrate reset` 