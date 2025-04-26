import { Publisher } from './base-publisher';
import { 
  UserCreatedEvent, 
  UserUpdatedEvent, 
  UserDeletedEvent,
  UserLoggedInEvent,
  UserRoleChangedEvent 
} from '../events/user-events';

/**
 * Publisher for user created events
 */
export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  readonly subject = 'user.created';
}

/**
 * Publisher for user updated events
 */
export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  readonly subject = 'user.updated';
}

/**
 * Publisher for user deleted events
 */
export class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
  readonly subject = 'user.deleted';
}

/**
 * Publisher for user logged in events
 */
export class UserLoggedInPublisher extends Publisher<UserLoggedInEvent> {
  readonly subject = 'user.logged_in';
}

/**
 * Publisher for user role changed events
 */
export class UserRoleChangedPublisher extends Publisher<UserRoleChangedEvent> {
  readonly subject = 'user.role_changed';
} 