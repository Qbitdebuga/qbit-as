import { JournalEntryLine } from './journal-entry-line.entity';

export class JournalEntry {
  id!: string | null;
  entryNumber!: string | null;
  date!: Date;
  reference?: string | null;
  description?: string | null;
  status!: string | null; // DRAFT, POSTED, REVERSED
  isAdjustment!: boolean | null;
  lines!: JournalEntryLine[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<JournalEntry>) {
    Object.assign(this, partial);
  }
} 