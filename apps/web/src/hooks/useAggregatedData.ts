'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';

// Types for the aggregated data
export interface UserFinancialOverview {
  user: {
    id: string;
    name: string;
    email: string;
  };
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    summary: any;
  };
  incomeStatement: {
    revenue: number;
    expenses: number;
    netIncome: number;
    summary: any;
  };
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    summary: any;
  };
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
}

export interface AccountDetails {
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
    subtype: string;
    balance: number;
  };
  transactions: Array<{
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    amount: number;
    balance: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    debits: number;
    credits: number;
    netChange: number;
  }>;
}

export function useAggregatedData() {
  const { client, loading: clientLoading, executeWithAuth } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch financial overview data for the current user
   */
  const getUserFinancialOverview = useCallback(async (): Promise<UserFinancialOverview | null> => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        const response = await client.get('/aggregation/financial-overview');
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  /**
   * Get account details with transactions
   */
  const getAccountWithTransactions = useCallback(async (accountId: string): Promise<AccountDetails | null> => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        const response = await client.get(`/aggregation/accounts/${accountId}/details`);
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  /**
   * Get financial statements for a specified date range
   */
  const getFinancialStatements = useCallback(async (
    type: 'balance-sheet' | 'income-statement' | 'cash-flow',
    startDate?: string,
    endDate?: string,
    asOfDate?: string
  ) => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        // Build the query params
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (asOfDate) params.append('asOfDate', asOfDate);
        
        const queryString = params.toString();
        const url = `/aggregation/financial-statements/${type}${queryString ? `?${queryString}` : ''}`;
        
        const response = await client.get(url);
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  /**
   * Get dashboard summary data
   */
  const getDashboardSummary = useCallback(async () => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        const response = await client.get('/aggregation/dashboard-summary');
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  return {
    loading: loading || clientLoading,
    error,
    getUserFinancialOverview,
    getAccountWithTransactions,
    getFinancialStatements,
    getDashboardSummary,
  };
} 