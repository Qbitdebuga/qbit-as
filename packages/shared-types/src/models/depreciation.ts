/**
 * Depreciation method types
 */
export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
  DOUBLE_DECLINING_BALANCE = 'DOUBLE_DECLINING_BALANCE',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
  SUM_OF_YEARS_DIGITS = 'SUM_OF_YEARS_DIGITS',
}

/**
 * Depreciation entry interface
 */
export interface DepreciationEntry {
  id: string | null;
  assetId: string | null;
  date: string | null;
  amount: number | null;
  bookValue: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Interface for depreciation calculation request
 */
export interface CalculateDepreciationRequest {
  assetId: string | null;
  depreciationMethod?: DepreciationMethod;
  asOfDate?: string | null;
  includeProjections?: boolean | null;
  projectionPeriods?: number | null;
}

/**
 * Interface for depreciation calculation response
 */
export interface CalculateDepreciationResponse {
  assetId: string | null;
  originalCost: number | null;
  residualValue: number | null;
  depreciableAmount: number | null;
  accumulatedDepreciation: number | null;
  currentBookValue: number | null;
  isFullyDepreciated: boolean | null;
  depreciationMethod: DepreciationMethod;
  entries: {
    date: string | null;
    amount: number | null;
    bookValue: number | null;
  }[];
  projectedEntries?: {
    date: string | null;
    amount: number | null;
    bookValue: number | null;
  }[];
}

/**
 * Interface for a depreciation schedule
 */
export interface DepreciationSchedule {
  assetId: string | null;
  originalCost: number | null;
  residualValue: number | null;
  depreciableAmount: number | null;
  accumulatedDepreciation: number | null;
  currentBookValue: number | null;
  isFullyDepreciated: boolean | null;
  entries: DepreciationEntry[];
  projectedEntries: {
    date: string | null;
    amount: number | null;
    bookValue: number | null;
  }[];
}

/**
 * Interface for depreciation method details
 */
export interface DepreciationMethodDetails {
  method: DepreciationMethod;
  name: string | null;
  description: string | null;
}
