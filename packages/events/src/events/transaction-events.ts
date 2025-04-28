import { Event } from '../publishers/base-publisher';

/**
 * Transaction interface for events
 */
export interface TransactionEntryEventData {
  id: string | null;
  accountId: string | null;
  amount: number | null;
  currency: string | null;
  type: 'DEBIT' | 'CREDIT';
}

export interface TransactionEventData {
  id: string | null;
  date: string | null;
  description: string | null;
  reference?: string | null;
  entries: TransactionEntryEventData[];
  createdAt: string | null;
  createdById: string | null;
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
    id: string | null;
    changes: Partial<TransactionEventData>;
    updatedById: string | null;
  };
}

// Transaction posted event
export interface TransactionPostedEvent extends Event {
  subject: 'transaction.posted';
  data: {
    id: string | null;
    postedAt: string | null;
    postedById: string | null;
  };
}

// Transaction voided event
export interface TransactionVoidedEvent extends Event {
  subject: 'transaction.voided';
  data: {
    id: string | null;
    reason: string | null;
    voidedAt: string | null;
    voidedById: string | null;
  };
} 