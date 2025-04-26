import { Listener } from './base-listener';
import { 
  UserCreatedEvent, 
  UserUpdatedEvent, 
  UserDeletedEvent,
  UserLoggedInEvent,
  UserRoleChangedEvent 
} from '../events/user-events';
import { JsMsg } from 'nats';

/**
 * Example base user event listener
 * Services should extend this class to implement their own user event listeners
 */
export abstract class UserCreatedListener extends Listener<UserCreatedEvent> {
  readonly subject = 'user.created';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: UserCreatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base user updated listener
 * Services should extend this class to implement their own user event listeners
 */
export abstract class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  readonly subject = 'user.updated';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: UserUpdatedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base user deleted listener
 * Services should extend this class to implement their own user event listeners
 */
export abstract class UserDeletedListener extends Listener<UserDeletedEvent> {
  readonly subject = 'user.deleted';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: UserDeletedEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base user logged in listener
 * Services should extend this class to implement their own user event listeners
 */
export abstract class UserLoggedInListener extends Listener<UserLoggedInEvent> {
  readonly subject = 'user.logged_in';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: UserLoggedInEvent['data'], msg: JsMsg): Promise<void>;
}

/**
 * Example base user role changed listener
 * Services should extend this class to implement their own user event listeners
 */
export abstract class UserRoleChangedListener extends Listener<UserRoleChangedEvent> {
  readonly subject = 'user.role_changed';
  abstract readonly queueGroup: string;
  
  abstract onMessage(data: UserRoleChangedEvent['data'], msg: JsMsg): Promise<void>;
} 