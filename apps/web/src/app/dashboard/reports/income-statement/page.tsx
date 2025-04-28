"use client";

import { useState, useEffect } from 'react';
import { IncomeStatementDto, StatementPeriod } from '@/mocks/shared-types';
import { ReportsClient } from '@/mocks/api-client';
import { useApiClient } from '@/hooks/useApiClient';
import { StatementFilters, StatementFilterValues } from '@/components/reports/StatementFilters';
import { IncomeStatementReport } from '@/components/reports/IncomeStatementReport';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function IncomeStatementPage() {
  const { client } = useApiClient();
  const [report, setReport] = useState<IncomeStatementDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchIncomeStatement = async (filters: StatementFilterValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const reportsClient = new ReportsClient(client);
      const result = await reportsClient.generateIncomeStatement({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period,
        comparativePeriod: filters.comparativePeriod,
        includeZeroBalances: filters.includeZeroBalances
      });
      
      setReport(result);
    } catch (err: any) {
      console.error('Error fetching income statement:', err);
      setError(err.message || 'Failed to load income statement. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load with default filters
  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    fetchIncomeStatement({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      period: StatementPeriod.MONTHLY,
      comparativePeriod: false,
      includeZeroBalances: false
    });
  }, []);
  
  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Income Statement</h1>
      
      <StatementFilters 
        onApplyFilters={fetchIncomeStatement}
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
        <IncomeStatementReport report={report} />
      )}
    </div>
  );
} 