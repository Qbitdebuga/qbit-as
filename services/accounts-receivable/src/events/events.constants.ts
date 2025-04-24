/**
 * Customer-related event patterns
 */
export const CUSTOMER_EVENTS = {
  CREATED: 'customer.created',
  UPDATED: 'customer.updated',
  DELETED: 'customer.deleted',
};

/**
 * Invoice-related event patterns
 */
export const INVOICE_EVENTS = {
  CREATED: 'invoice.created',
  UPDATED: 'invoice.updated',
  DELETED: 'invoice.deleted',
  PAID: 'invoice.paid',
  OVERDUE: 'invoice.overdue',
};

/**
 * Payment-related event patterns
 */
export const PAYMENT_EVENTS = {
  CREATED: 'payment.created',
  UPDATED: 'payment.updated',
  DELETED: 'payment.deleted',
  PROCESSED: 'payment.processed',
  FAILED: 'payment.failed',
};

/**
 * Standard event payload structure
 */
export interface EventPayload<T> {
  serviceSource: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  data: T;
} 