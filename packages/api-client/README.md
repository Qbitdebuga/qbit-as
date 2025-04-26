# Qbit API Client

The centralized API client package for the Qbit Accounting System. This package provides standardized API clients for both frontend applications and service-to-service communication.

## Features

- Standard client interface for all API endpoints
- Automatic token management and renewal
- Cookie-based authentication with CSRF protection
- Service-to-service authentication
- Request/response interceptors
- Standardized error handling
- TypeScript type definitions for all API requests and responses

## Installation

```bash
# Install as a dependency in another package
yarn add @qbit/api-client
```

## Usage

### User Authentication Client

```typescript
import { authClient } from '@qbit/api-client';

// Login
const loginResult = await authClient.login({
  email: 'user@example.com',
  password: 'password'
});

// Get user profile
const user = await authClient.getProfile();

// Logout
await authClient.logout();
```

### API Client for Resources

```typescript
import { accountsClient } from '@qbit/api-client';

// Get list of accounts
const accounts = await accountsClient.getAccounts({
  type: 'ASSET',
  isActive: true
});

// Get single account
const account = await accountsClient.getAccount('account-id');

// Create account
const newAccount = await accountsClient.createAccount({
  name: 'Cash',
  number: '1000',
  type: 'ASSET'
});

// Update account
const updatedAccount = await accountsClient.updateAccount('account-id', {
  name: 'Updated Cash Account'
});
```

### Creating Custom Clients

Use the `BaseApiClient` for creating custom clients:

```typescript
import { BaseApiClient } from '@qbit/api-client';

class MyCustomClient {
  private client: BaseApiClient;
  
  constructor(baseUrl: string) {
    this.client = new BaseApiClient(baseUrl);
  }
  
  async getData() {
    return this.client.get('/my-endpoint');
  }
}
```

### Service-to-Service Communication

Use the `ServiceApiClient` for secure service-to-service communication:

```typescript
import { createServiceClient } from '@qbit/api-client';

// Create a service client
const serviceClient = createServiceClient(
  'http://api.example.com',
  'my-service-id',
  'My Service',
  'http://auth.example.com'
);

// Call another service
const data = await serviceClient.callService(
  'GET',
  '/other-service/endpoint',
  null,
  {},
  ['read:data']
);
```

## Advanced Features

### Request Interceptors

```typescript
import { baseApiClient } from '@qbit/api-client';

// Add a request interceptor
baseApiClient.addRequestInterceptor(async (config) => {
  console.log(`Making ${config.method} request to ${config.url}`);
  return config;
});
```

### Response Interceptors

```typescript
baseApiClient.addResponseInterceptor(async (response) => {
  console.log('Received response:', response);
  return response;
});
```

### Error Interceptors

```typescript
baseApiClient.addErrorInterceptor(async (error) => {
  console.error('Request failed:', error);
  // Rethrow the error
  throw error;
});
```

## Available Clients

- `authClient`: Authentication and user management
- `accountsClient`: Chart of accounts management
- `journalEntriesClient`: Journal entries and transactions
- `reportsClient`: Financial reports
- `customersClient`: Customer management
- `invoicesClient`: Invoice management
- `paymentsClient`: Payment processing
- `vendorsClient`: Vendor management
- `billsClient`: Bill management
- `productsClient`: Product management
- `inventoryClient`: Inventory management

## API Documentation

For detailed API documentation, please refer to the [API Documentation](https://docs.qbit.example.com/api). 