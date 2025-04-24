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
  id: string;
  assetId: string;
  date: string;
  amount: number;
  bookValue: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for depreciation calculation request
 */
export interface CalculateDepreciationRequest {
  assetId: string;
  depreciationMethod?: DepreciationMethod;
  asOfDate?: string;
  includeProjections?: boolean;
  projectionPeriods?: number;
}

/**
 * Interface for depreciation calculation response
 */
export interface CalculateDepreciationResponse {
  assetId: string;
  originalCost: number;
  residualValue: number;
  depreciableAmount: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  isFullyDepreciated: boolean;
  depreciationMethod: DepreciationMethod;
  entries: {
    date: string;
    amount: number;
    bookValue: number;
  }[];
  projectedEntries?: {
    date: string;
    amount: number;
    bookValue: number;
  }[];
}

/**
 * Interface for a depreciation schedule
 */
export interface DepreciationSchedule {
  assetId: string;
  originalCost: number;
  residualValue: number;
  depreciableAmount: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  isFullyDepreciated: boolean;
  entries: DepreciationEntry[];
  projectedEntries: {
    date: string;
    amount: number;
    bookValue: number;
  }[];
}

/**
 * Interface for depreciation method details
 */
export interface DepreciationMethodDetails {
  method: DepreciationMethod;
  name: string;
  description: string;
} 