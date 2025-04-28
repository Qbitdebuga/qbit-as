import { JournalEntryLine } from './journal-entry-line.entity.js';

export class JournalEntry {
  id!: string;
  entryNumber!: string;
  date!: Date;
  reference?: string;
  description?: string;
  status!: string; // DRAFT, POSTED, REVERSED
  isAdjustment!: boolean;
  lines!: JournalEntryLine[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<JournalEntry>) {
    Object.assign(this, partial);
  }
} 