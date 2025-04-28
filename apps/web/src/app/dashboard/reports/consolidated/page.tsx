'use client';

import { useEffect, useState } from 'react';
import { useAggregatedData } from '@/hooks/useAggregatedData';
import ConsolidatedReport from '@/components/reports/ConsolidatedReport';

export default function ConsolidatedReportPage() {
  const { getFinancialStatements, loading, error } = useAggregatedData();
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);

      try {
        // Get all financial statements in parallel
        const [balanceSheetData, incomeStatementData, cashFlowData] = await Promise.all([
          getFinancialStatements('balance-sheet', null, null, selectedDate),
          getFinancialStatements('income-statement', null, null, selectedDate),
          getFinancialStatements('cash-flow', null, null, selectedDate),
        ]);

        setBalanceSheet(balanceSheetData);
        setIncomeStatement(incomeStatementData);
        setCashFlow(cashFlowData);
      } catch (err) {
        console.error('Error loading financial statements:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [getFinancialStatements, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Consolidated Financial Reports</h1>

        <div className="mt-4 md:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {isLoading || loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600 text-sm mt-1">
            {error.message || 'Failed to load financial data'}
          </p>
        </div>
      ) : (
        <ConsolidatedReport
          balanceSheet={balanceSheet}
          incomeStatement={incomeStatement}
          cashFlow={cashFlow}
          asOfDate={selectedDate}
        />
      )}
    </div>
  );
}
