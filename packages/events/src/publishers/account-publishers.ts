import { Publisher } from './base-publisher';
import { 
  AccountCreatedEvent, 
  AccountUpdatedEvent, 
  AccountDeletedEvent,
  AccountBalanceChangedEvent 
} from '../events/account-events';

/**
 * Publisher for account created events
 */
export class AccountCreatedPublisher extends Publisher<AccountCreatedEvent> {
  readonly subject = 'account.created';
}

/**
 * Publisher for account updated events
 */
export class AccountUpdatedPublisher extends Publisher<AccountUpdatedEvent> {
  readonly subject = 'account.updated';
}

/**
 * Publisher for account deleted events
 */
export class AccountDeletedPublisher extends Publisher<AccountDeletedEvent> {
  readonly subject = 'account.deleted';
}

/**
 * Publisher for account balance changed events
 */
export class AccountBalanceChangedPublisher extends Publisher<AccountBalanceChangedEvent> {
  readonly subject = 'account.balance_changed';
} 