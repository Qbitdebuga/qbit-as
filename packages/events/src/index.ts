// Main entry point for the events package

// Export the NATS client
export * from './clients/nats-client';

// Export the base publisher and listener
export * from './publishers/base-publisher';
export * from './listeners/base-listener';

// Export event types
export * from './events/user-events';
export * from './events/account-events';
export * from './events/transaction-events';

// Export publishers
export * from './publishers/user-publishers';
export * from './publishers/account-publishers';
export * from './publishers/transaction-publishers';

// Export listeners
export * from './listeners/user-listeners';
export * from './listeners/account-listeners';
export * from './listeners/transaction-listeners';

// Re-export required NATS types
export { JsMsg, ConsumerConfig } from 'nats'; 