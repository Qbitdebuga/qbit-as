import { Event } from '../publishers/base-publisher';

/**
 * Account interface for events
 */
export interface AccountEventData {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: string | null;
  category: string | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdById: string | null;
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
    id: string | null;
    changes: Partial<AccountEventData>;
    updatedById: string | null;
  };
}

// Account deleted (or deactivated) event
export interface AccountDeletedEvent extends Event {
  subject: 'account.deleted';
  data: {
    id: string | null;
    deactivatedById: string | null;
  };
}

// Account balance changed event
export interface AccountBalanceChangedEvent extends Event {
  subject: 'account.balance_changed';
  data: {
    id: string | null;
    previousBalance: number | null;
    newBalance: number | null;
    transactionId: string | null;
    timestamp: string | null;
  };
} 