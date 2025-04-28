// Account related DTOs
export interface AccountDto {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: string | null;
  subtype: string | null;
  isActive: boolean | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Entry related DTOs
export interface JournalEntryLineDto {
  id: string | null;
  accountId: string | null;
  account?: AccountDto;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryDto {
  id: string | null;
  entryNumber: string | null;
  date: Date;
  description?: string | null;
  reference?: string | null;
  status: string | null;
  isAdjustment: boolean | null;
  lines: JournalEntryLineDto[];
  createdAt: Date;
  updatedAt: Date;
}

// Financial Statement related DTOs
export interface StatementRequestDto {
  startDate?: string | null;
  endDate?: string | null;
  asOfDate?: string | null;
  includeZeroBalances?: boolean | null;
  comparativePeriod?: boolean | null;
}

export interface FinancialStatementItemDto {
  id: string | null;
  code: string | null;
  name: string | null;
  type: string | null;
  amount: number | null;
  previousAmount?: number | null;
  percentChange?: number | null;
  children?: FinancialStatementItemDto[];
}

export interface FinancialStatementSectionDto {
  id: string | null;
  title: string | null;
  total: number | null;
  previousTotal?: number | null;
  percentChange?: number | null;
  items: FinancialStatementItemDto[];
}

export interface FinancialStatementDto {
  title: string | null;
  subtitle: string | null;
  startDate?: string | null;
  endDate?: string | null;
  asOfDate?: string | null;
  sections: FinancialStatementSectionDto[];
  total: number | null;
  previousTotal?: number | null;
  percentChange?: number | null;
  reportDate: string | null;
}
