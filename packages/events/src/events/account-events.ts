import { Event } from '../publishers/base-publisher';

/**
 * Account interface for events
 */
export interface AccountEventData {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

// Account created event
export interface AccountCreatedEvent extends Event {
  subject: 'account.created';
  data: AccountEventData;
}

// Account updated event
export interface AccountUpdatedEvent extends Event {
  subject: 'account.updated';
  data: {
    id: string;
    changes: Partial<AccountEventData>;
    updatedById: string;
  };
}

// Account deleted (or deactivated) event
export interface AccountDeletedEvent extends Event {
  subject: 'account.deleted';
  data: {
    id: string;
    deactivatedById: string;
  };
}

// Account balance changed event
export interface AccountBalanceChangedEvent extends Event {
  subject: 'account.balance_changed';
  data: {
    id: string;
    previousBalance: number;
    newBalance: number;
    transactionId: string;
    timestamp: string;
  };
} 