import { Account } from '../../accounts/entities/account.entity';
import { JournalEntry } from './journal-entry.entity';

export class JournalEntryLine {
  id!: string | null;
  journalEntryId!: string | null;
  journalEntry!: JournalEntry;
  accountId!: string | null;
  account!: Account;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<JournalEntryLine>) {
    Object.assign(this, partial);
  }
} 