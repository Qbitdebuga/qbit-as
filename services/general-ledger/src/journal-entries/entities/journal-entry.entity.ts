import { JournalEntryLine } from './journal-entry-line.entity';

export class JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description?: string;
  reference?: string;
  status: string; // DRAFT, POSTED, REVERSED
  isAdjustment: boolean;
  lines: JournalEntryLine[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<JournalEntry>) {
    Object.assign(this, partial);
  }
} 