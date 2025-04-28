# Qbit Accounting System: Service Interactions

This document describes how the different microservices in Qbit Accounting System interact with each other.

## Interaction Patterns

The Qbit Accounting System uses two primary patterns for service interactions:

1. **Synchronous REST API calls** - Used for immediate request-response interactions
2. **Asynchronous Event-based messaging** - Used for decoupled, eventually consistent operations

## Service Dependency Map

Below is a high-level dependency map showing which services interact with each other:

```
                                 ┌─────────────┐
                         ┌──────►│ Fixed Assets│
                         │       └─────────────┘
                         │
┌─────────┐         ┌────┴────┐         ┌─────────────────┐
│ Auth    │◄────────┤ General │◄────────┤ Accounts Payable│
└─────┬───┘         │ Ledger  │         └─────────────────┘
      │             └────┬────┘
      │                  │             ┌───────────────────┐
      │                  └─────────────┤ Accounts Receivable│
┌─────▼───┐                            └───────────────────┘
│ API     │
│ Gateway │                            ┌──────────┐
└─────┬───┘                        ┌───┤ Inventory│
      │                            │   └──────────┘
      │                            │
      │                       ┌────▼───┐
      └───────────────────────┤ Banking│
                              └────────┘
```

## Key Service Interactions

### Authentication Flow

1. **Client → API Gateway → Auth Service**
   - Client sends login credentials to API Gateway
   - API Gateway forwards request to Auth Service
   - Auth Service validates credentials and returns JWT token
   - API Gateway forwards token to client

2. **Service-to-service authentication**
   - Services request service tokens from Auth Service
   - Services present these tokens when calling other services

### Financial Transaction Flow

1. **Journal Entry Creation**
   - Services (Accounts Payable, Accounts Receivable, etc.) call General Ledger service to create journal entries
   - General Ledger processes and validates entries
   - General Ledger publishes events for successful journal entries

2. **Financial Reporting**
   - Reporting service subscribes to events from General Ledger
   - Reporting service maintains read models optimized for reporting
   - API Gateway fetches reports from Reporting service

## REST API Interactions

Below are the main REST API interactions between services:

| Source Service | Target Service | Endpoint Pattern | Purpose |
|----------------|----------------|-----------------|---------|
| API Gateway | Auth | `/auth/*` | User authentication |
| API Gateway | General Ledger | `/gl/*` | Financial operations |
| Accounts Payable | General Ledger | `/journal-entries` | Create journal entries |
| Accounts Receivable | General Ledger | `/journal-entries` | Create journal entries |
| Fixed Assets | General Ledger | `/journal-entries` | Record asset depreciation |
| Banking | General Ledger | `/journal-entries` | Record bank transactions |
| All Services | Auth | `/auth/service/token` | Get service tokens |

## Event-based Interactions

The system uses RabbitMQ for asynchronous event messaging. Key event flows:

### User Events
- `user.created` - Published by Auth service when new users are created
- `user.updated` - Published by Auth service when user details change
- `user.deleted` - Published by Auth service when users are removed

### Financial Events
- `journal-entry.created` - Published by General Ledger when new entries are created
- `journal-entry.posted` - Published by General Ledger when entries are posted to the ledger
- `account.updated` - Published by General Ledger when account balances change

### Inventory Events
- `inventory.adjusted` - Published by Inventory service when stock levels change
- `product.created` - Published by Inventory service when new products are added
- `product.updated` - Published by Inventory service when product details change

### Payment Events
- `invoice.paid` - Published by Accounts Receivable when invoices are paid
- `bill.paid` - Published by Accounts Payable when bills are paid

## Error Handling

For service interaction errors:

1. **Synchronous calls**:
   - Services return appropriate HTTP status codes
   - Error details are provided in response bodies
   - Timeouts are configured to avoid long-waiting requests

2. **Asynchronous events**:
   - Dead-letter queues capture failed event processing
   - Retry policies are implemented for transient failures
   - Event schemas include correlation IDs for tracking

## Circuit Breaking

The system implements circuit breaking to handle service failures:

- API Gateway uses circuit breakers when calling downstream services
- Services use circuit breakers when calling other services
- Circuit breaker metrics are exposed for monitoring

## Performance Considerations

To ensure responsive service interactions:

- Services maintain connection pools for database and HTTP connections
- Caching is used for frequently accessed, relatively static data
- Query optimization is applied for database interactions

## Monitoring Service Interactions

The system provides monitoring for service interactions:

- Distributed tracing with correlation IDs across service boundaries
- Metrics for request rates, latencies, and error rates
- Logging for debugging and audit purposes 