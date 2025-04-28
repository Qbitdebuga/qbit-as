import { Event } from '../publishers/base-publisher';
import { UserDto } from '@qbit/shared-types';

// User created event
export interface UserCreatedEvent extends Event {
  subject: 'user.created';
  data: Omit<UserDto, 'password'>;
}

// User updated event
export interface UserUpdatedEvent extends Event {
  subject: 'user.updated';
  data: {
    id: string | null;
    changes: Partial<Omit<UserDto, 'password'>>;
  };
}

// User deleted event
export interface UserDeletedEvent extends Event {
  subject: 'user.deleted';
  data: {
    id: string | null;
  };
}

// User logged in event
export interface UserLoggedInEvent extends Event {
  subject: 'user.logged_in';
  data: {
    id: string | null;
    timestamp: string | null;
    ip?: string | null;
    userAgent?: string | null;
  };
}

// User role changed event
export interface UserRoleChangedEvent extends Event {
  subject: 'user.role_changed';
  data: {
    id: string | null;
    oldRoles: string[];
    newRoles: string[];
  };
} 