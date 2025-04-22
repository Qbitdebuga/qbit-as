// Account related DTOs
export interface AccountDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  subtype: string;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Entry related DTOs
export interface JournalEntryLineDto {
  id: string;
  accountId: string;
  account?: AccountDto;
  description?: string;
  debit?: number;
  credit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryDto {
  id: string;
  entryNumber: string;
  date: Date;
  description?: string;
  reference?: string;
  status: string;
  isAdjustment: boolean;
  lines: JournalEntryLineDto[];
  createdAt: Date;
  updatedAt: Date;
}

// Financial Statement related DTOs
export interface StatementRequestDto {
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  includeZeroBalances?: boolean;
  comparativePeriod?: boolean;
}

export interface FinancialStatementItemDto {
  id: string;
  code: string;
  name: string;
  type: string;
  amount: number;
  previousAmount?: number;
  percentChange?: number;
  children?: FinancialStatementItemDto[];
}

export interface FinancialStatementSectionDto {
  id: string;
  title: string;
  total: number;
  previousTotal?: number;
  percentChange?: number;
  items: FinancialStatementItemDto[];
}

export interface FinancialStatementDto {
  title: string;
  subtitle: string;
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  sections: FinancialStatementSectionDto[];
  total: number;
  previousTotal?: number;
  percentChange?: number;
  reportDate: string;
} 