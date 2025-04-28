import { Account } from '../../accounts/entities/account.entity.js';
import { JournalEntry } from './journal-entry.entity.js';

export class JournalEntryLine {
  id!: string;
  journalEntryId!: string;
  journalEntry!: JournalEntry;
  accountId!: string;
  account!: Account;
  description?: string;
  debit?: number;
  credit?: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<JournalEntryLine>) {
    Object.assign(this, partial);
  }
} 