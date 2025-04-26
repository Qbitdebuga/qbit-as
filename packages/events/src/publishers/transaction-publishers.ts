import { Publisher } from './base-publisher';
import { 
  TransactionCreatedEvent, 
  TransactionUpdatedEvent, 
  TransactionPostedEvent,
  TransactionVoidedEvent 
} from '../events/transaction-events';

/**
 * Publisher for transaction created events
 */
export class TransactionCreatedPublisher extends Publisher<TransactionCreatedEvent> {
  readonly subject = 'transaction.created';
}

/**
 * Publisher for transaction updated events
 */
export class TransactionUpdatedPublisher extends Publisher<TransactionUpdatedEvent> {
  readonly subject = 'transaction.updated';
}

/**
 * Publisher for transaction posted events
 */
export class TransactionPostedPublisher extends Publisher<TransactionPostedEvent> {
  readonly subject = 'transaction.posted';
}

/**
 * Publisher for transaction voided events
 */
export class TransactionVoidedPublisher extends Publisher<TransactionVoidedEvent> {
  readonly subject = 'transaction.voided';
} 