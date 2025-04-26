import { Listener } from './base-listener';
import { 
  TransactionCreatedEvent, 
  TransactionUpdatedEvent, 
  TransactionPostedEvent,
  TransactionVoidedEvent 
} from '../events/transaction-events';
import { JsMsg } from 'nats';

/**
 * Example base transaction created listener
 * Services should extend this class to implement their own transaction event listeners
 */
export abstract class TransactionCreatedListener extends Listener<TransactionCreatedEvent> {
  readonly subject = 'transaction.created';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: TransactionCreatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base transaction updated listener
 * Services should extend this class to implement their own transaction event listeners
 */
export abstract class TransactionUpdatedListener extends Listener<TransactionUpdatedEvent> {
  readonly subject = 'transaction.updated';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: TransactionUpdatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base transaction posted listener
 * Services should extend this class to implement their own transaction event listeners
 */
export abstract class TransactionPostedListener extends Listener<TransactionPostedEvent> {
  readonly subject = 'transaction.posted';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: TransactionPostedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base transaction voided listener
 * Services should extend this class to implement their own transaction event listeners
 */
export abstract class TransactionVoidedListener extends Listener<TransactionVoidedEvent> {
  readonly subject = 'transaction.voided';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: TransactionVoidedEvent['data'], msg: JsMsg): Promise<void>;
} 