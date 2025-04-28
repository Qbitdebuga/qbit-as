import { Listener } from './base-listener';
import { 
  AccountCreatedEvent, 
  AccountUpdatedEvent, 
  AccountDeletedEvent,
  AccountBalanceChangedEvent 
} from '../events/account-events';
import { JsMsg } from 'nats';

/**
 * Example base account created listener
 * Services should extend this class to implement their own account event listeners
 */
export abstract class AccountCreatedListener extends Listener<AccountCreatedEvent> {
  readonly subject = 'account.created';
  abstract readonly queueGroup: string | null;
  
  abstract onMessage(data: AccountCreatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base account updated listener
 * Services should extend this class to implement their own account event listeners
 */
export abstract class AccountUpdatedListener extends Listener<AccountUpdatedEvent> {
  readonly subject = 'account.updated';
  abstract readonly queueGroup: string | null;
  
  abstract onMessage(data: AccountUpdatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base account deleted listener
 * Services should extend this class to implement their own account event listeners
 */
export abstract class AccountDeletedListener extends Listener<AccountDeletedEvent> {
  readonly subject = 'account.deleted';
  abstract readonly queueGroup: string | null;
  
  abstract onMessage(data: AccountDeletedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base account balance changed listener
 * Services should extend this class to implement their own account event listeners
 */
export abstract class AccountBalanceChangedListener extends Listener<AccountBalanceChangedEvent> {
  readonly subject = 'account.balance_changed';
  abstract readonly queueGroup: string | null;
  
  abstract onMessage(data: AccountBalanceChangedEvent['data'], msg: JsMsg): Promise<void>;
} 