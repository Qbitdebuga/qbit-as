import { Event } from '../publishers/base-publisher';

/**
 * Transaction interface for events
 */
export interface TransactionEntryEventData {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'DEBIT' | 'CREDIT';
}

export interface TransactionEventData {
  id: string;
  date: string;
  description: string;
  reference?: string;
  entries: TransactionEntryEventData[];
  createdAt: string;
  createdById: string;
  status: 'DRAFT' | 'PENDING' | 'POSTED' | 'VOIDED';
}

// Transaction created event
export interface TransactionCreatedEvent extends Event {
  subject: 'transaction.created';
  data: TransactionEventData;
}

// Transaction updated event
export interface TransactionUpdatedEvent extends Event {
  subject: 'transaction.updated';
  data: {
    id: string;
    changes: Partial<TransactionEventData>;
    updatedById: string;
  };
}

// Transaction posted event
export interface TransactionPostedEvent extends Event {
  subject: 'transaction.posted';
  data: {
    id: string;
    postedAt: string;
    postedById: string;
  };
}

// Transaction voided event
export interface TransactionVoidedEvent extends Event {
  subject: 'transaction.voided';
  data: {
    id: string;
    reason: string;
    voidedAt: string;
    voidedById: string;
  };
} 