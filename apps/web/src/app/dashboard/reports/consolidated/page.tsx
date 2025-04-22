'use client';

import React, { useState, useEffect } from 'react';
import { useAggregatedData } from '../../../../hooks/useAggregatedData';
import ConsolidatedReport from '../../../../components/reports/ConsolidatedReport';

export default function ConsolidatedReportPage() {
  const { getFinancialStatements, loading, error } = useAggregatedData();
  const [balanceSheet, setBalanceSheet] = useState<any | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<any | null>(null);
  const [cashFlow, setCashFlow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get the end of the current month for the selected date
        const date = new Date(selectedDate);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const endDateString = endDate.toISOString().split('T')[0];
        
        // Get the start of the year
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const startDateString = startOfYear.toISOString().split('T')[0];
        
        // Fetch all reports in parallel
        const [balanceSheetData, incomeStatementData, cashFlowData] = await Promise.all([
          getFinancialStatements('balance-sheet', null, null, endDateString),
          getFinancialStatements('income-statement', startDateString, endDateString),
          getFinancialStatements('cash-flow', startDateString, endDateString)
        ]);
        
        setBalanceSheet(balanceSheetData);
        setIncomeStatement(incomeStatementData);
        setCashFlow(cashFlowData);
      } catch (err) {
        console.error('Failed to fetch financial data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getFinancialStatements, selectedDate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Consolidated Financial Reports</h1>
        
        <div className="mt-4 md:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Date
          </label>
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