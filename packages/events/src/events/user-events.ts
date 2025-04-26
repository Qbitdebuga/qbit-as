import { Event } from '../publishers/base-publisher';
import { User } from '@qbit/shared-types';

// User created event
export interface UserCreatedEvent extends Event {
  subject: 'user.created';
  data: Omit<User, 'password'>;
}

// User updated event
export interface UserUpdatedEvent extends Event {
  subject: 'user.updated';
  data: {
    id: string;
    changes: Partial<Omit<User, 'password'>>;
  };
}

// User deleted event
export interface UserDeletedEvent extends Event {
  subject: 'user.deleted';
  data: {
    id: string;
  };
}

// User logged in event
export interface UserLoggedInEvent extends Event {
  subject: 'user.logged_in';
  data: {
    id: string;
    timestamp: string;
    ip?: string;
    userAgent?: string;
  };
}

// User role changed event
export interface UserRoleChangedEvent extends Event {
  subject: 'user.role_changed';
  data: {
    id: string;
    oldRoles: string[];
    newRoles: string[];
  };
} 