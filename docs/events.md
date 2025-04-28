# Qbit Accounting System: Event System

This document describes the event-driven architecture used by Qbit Accounting System for inter-service communication.

## Event Architecture Overview

The Qbit Accounting System uses an event-driven architecture for asynchronous, loosely-coupled communication between microservices. This ensures:

- Services can operate independently
- Changes in one service don't require immediate changes in others
- System is resilient to service failures
- Operations can be executed in an eventually consistent manner

## Event Infrastructure

### Message Broker

The system uses RabbitMQ as the message broker for event delivery:

```
┌───────────┐     ┌──────────┐     ┌────────────┐
│ Publisher │────►│ RabbitMQ │────►│ Subscriber │
└───────────┘     └──────────┘     └────────────┘
```

- **Exchanges**: Topic exchanges are used for routing messages to appropriate queues
- **Queues**: Durable queues ensure messages are persisted
- **Bindings**: Connect exchanges to queues based on routing patterns

### Event Package

The shared `@qbit/events` package provides consistent infrastructure for all services:

```
events/
├── src/
│   ├── clients/
│   │   └── nats-client.ts        # Client for connecting to NATS
│   ├── publishers/
│   │   └── base-publisher.ts     # Abstract base publisher class
│   ├── listeners/
│   │   └── base-listener.ts      # Abstract base listener class
│   └── schemas/                  # Event schemas and validators
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Event Structure

All events in the system follow a standard structure:

```typescript
interface Event<T> {
  subject: string;        // Event type identifier
  data: T;                // Typed payload data
  metadata?: {
    timestamp: string;    // ISO timestamp of when the event was created
    source: string;       // Service that generated the event
    correlationId: string; // ID for tracking related events
    userId?: string;      // User who initiated the action (if applicable)
  };
}
```

## Naming Conventions

Events follow a standardized naming convention:

```
{entity}.{action}
```

Examples:
- `user.created`
- `journal-entry.posted`
- `invoice.paid`

## Publishing Events

Services publish events when significant state changes occur. For example:

```typescript
import { JournalEntryPublisher } from '@qbit/events';

// Inside a service class
async createJournalEntry(data: CreateJournalEntryDto): Promise<JournalEntry> {
  // Create the entry in the database
  const journalEntry = await this.journalEntryRepository.create(data);
  
  // Publish an event
  await this.journalEntryPublisher.publish({
    id: journalEntry.id,
    date: journalEntry.date,
    reference: journalEntry.reference,
    status: journalEntry.status,
    totalAmount: journalEntry.totalAmount,
    lines: journalEntry.lines.map(line => ({
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
    })),
  });
  
  return journalEntry;
}
```

## Consuming Events

Services consume events by implementing listeners:

```typescript
import { JournalEntryPostedListener } from '@qbit/events';

export class JournalEntryConsumer extends JournalEntryPostedListener {
  async onMessage(data: JournalEntryPostedEvent['data'], msg: Message): Promise<void> {
    try {
      // Process the journal entry
      await this.reportingService.updateReports(data);
      
      // Acknowledge the message
      msg.ack();
    } catch (error) {
      // Log the error
      this.logger.error('Error processing journal entry', error);
      
      // Reject and requeue the message
      msg.nack();
    }
  }
}
```

## Event Versioning

Event schemas may evolve over time. To maintain compatibility:

1. **Backward Compatibility**: Add new fields as optional
2. **Versioning**: For breaking changes, create a new event type with a version suffix
   - Example: `user.created.v2`
3. **Transitional Period**: During migrations, publish both old and new versions

## Error Handling

The system implements robust error handling for events:

1. **Dead Letter Queues**: Failed messages are moved to DLQs
2. **Retry Policies**: Configurable retry attempts for transient errors
3. **Circuit Breaking**: Prevents cascading failures
4. **Idempotency**: Ensures operations can be safely retried

## Monitoring and Debugging

Event flow is monitored through:

- **Correlations IDs**: Track related events across services
- **Distributed Tracing**: Using OpenTelemetry integration
- **Logging**: Standardized logging of event publishing and processing
- **Metrics**: Message rates, processing times, and error rates

## Event Catalog

Below is a catalog of the primary events in the system:

### User Events
- `user.created` - A new user has been created
- `user.updated` - User information has been updated
- `user.deleted` - A user has been deleted

### Account Events
- `account.created` - A new GL account has been created
- `account.updated` - Account information has been updated
- `account.balance-updated` - Account balance has changed

### Journal Events
- `journal-entry.created` - A journal entry has been created
- `journal-entry.posted` - A journal entry has been posted to the ledger
- `journal-entry.reversed` - A journal entry has been reversed

### Invoice Events
- `invoice.created` - A new invoice has been created
- `invoice.sent` - An invoice has been sent to a customer
- `invoice.paid` - An invoice has been paid
- `invoice.voided` - An invoice has been voided

### Payment Events
- `payment.created` - A payment has been recorded
- `payment.applied` - A payment has been applied to invoices
- `payment.voided` - A payment has been voided

### Inventory Events
- `product.created` - A new product has been added
- `product.updated` - Product information has been updated
- `inventory.adjusted` - Inventory levels have been adjusted

## Event Testing

Each service includes tests for:

1. **Event Publishers**: Verify correct event structure and delivery
2. **Event Consumers**: Test processing logic and error handling
3. **Integration Tests**: End-to-end testing of event flows

## Implementation Guidelines

When implementing new events:

1. Define the event schema in `@qbit/events/schemas`
2. Create publisher class in the originating service
3. Implement listeners in all relevant services
4. Add tests for both publisher and listener
5. Document the event in the catalog

## Performance Considerations

For high-performance event processing:

- Use batching for high-volume events
- Implement back-pressure mechanisms
- Configure appropriate prefetch values
- Consider partitioning for parallel processing

## Best Practices

1. Keep event payloads small and focused
2. Include only necessary data (avoid entire entities)
3. Maintain backward compatibility
4. Handle duplicates gracefully
5. Implement retry with exponential backoff
6. Log all event processing with appropriate context
7. Use correlation IDs for tracking 