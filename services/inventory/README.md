# Inventory Management Service

This microservice is responsible for managing inventory, products, warehouses, and stock movements in the Qbit Accounting System.

## Features

- Product management (products, variants, categories)
- Warehouse management (locations, bins)
- Inventory tracking (stock levels, transactions)
- Integration with other services (accounting, sales, purchasing)

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the service
npm run start:dev
```

## Environment Variables

Copy the `.env.example` file to `.env` and update the variables as needed.

## API Documentation

Once the service is running, Swagger documentation is available at `http://localhost:3005/api/docs`. 