"use client";

import { useState, useEffect } from 'react';
import { BalanceSheetStatementDto, StatementPeriod } from '@qbit/shared-types';
import { ReportsClient } from '@qbit/api-client';
import { useApiClient } from '@/hooks/useApiClient';
import { StatementFilters, StatementFilterValues } from '@/components/reports/StatementFilters';
import { BalanceSheetReport } from '@/components/reports/BalanceSheetReport';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function BalanceSheetPage() {
  const { client } = useApiClient();
  const [report, setReport] = useState<BalanceSheetStatementDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBalanceSheet = async (filters: StatementFilterValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the local API route instead of the reportsClient
      const response = await fetch('/api/general-ledger/financial-statements/balance-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: filters.startDate,
          endDate: filters.endDate,
          period: filters.period,
          comparativePeriod: filters.comparativePeriod,
          includeZeroBalances: filters.includeZeroBalances
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      setReport(result);
    } catch (err: any) {
      console.error('Error fetching balance sheet:', err);
      setError(err.message || 'Failed to load balance sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load with default filters
  useEffect(() => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    
    fetchBalanceSheet({
      startDate: firstDayOfYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      period: StatementPeriod.MONTHLY,
      comparativePeriod: false,
      includeZeroBalances: false
    });
  }, []);
  
  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Balance Sheet</h1>
      
      <StatementFilters 
        onApplyFilters={fetchBalanceSheet}
        isLoading={loading}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {!loading && report && (
        <BalanceSheetReport report={report} />
      )}
    </div>
  );
} 