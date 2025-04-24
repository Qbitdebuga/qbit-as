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
- Yarn or npm
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