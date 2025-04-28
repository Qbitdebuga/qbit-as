'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FinancialOverview from '@/components/dashboard/FinancialOverview';
import ConsolidatedReportSummary from '@/components/reports/ConsolidatedReportSummary';
import { useAggregatedData } from '@/hooks/useAggregatedData';

export default function DashboardPage() {
  const router = useRouter();
  const { getDashboardSummary, getFinancialStatements, loading } = useAggregatedData();
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [financialReports, setFinancialReports] = useState<{
    balanceSheet: any | null;
    incomeStatement: any | null;
    cashFlow: any | null;
  }>({
    balanceSheet: null,
    incomeStatement: null,
    cashFlow: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get dashboard summary data
        const summary = await getDashboardSummary();
        if (summary) {
          setSummaryData(summary);
        }
        
        // Get latest financial reports for summary view
        const today = new Date();
        const endDateString = today.toISOString().split('T')[0];
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const startDateString = startOfYear.toISOString().split('T')[0];
        
        const [balanceSheetData, incomeStatementData, cashFlowData] = await Promise.all([
          getFinancialStatements('balance-sheet', undefined, undefined, endDateString),
          getFinancialStatements('income-statement', startDateString, endDateString),
          getFinancialStatements('cash-flow', startDateString, endDateString)
        ]);
        
        setFinancialReports({
          balanceSheet: balanceSheetData,
          incomeStatement: incomeStatementData,
          cashFlow: cashFlowData
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchData();
  }, [getDashboardSummary, getFinancialStatements]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row justify-end gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => navigateTo('/dashboard/journal-entries/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Transaction
          </button>
          <button 
            onClick={() => navigateTo('/dashboard/reports')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Reports
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Financial overview component */}
        <FinancialOverview />
        
        {/* Financial reports summary */}
        {!loading && (
          <ConsolidatedReportSummary 
            balanceSheet={financialReports.balanceSheet}
            incomeStatement={financialReports.incomeStatement}
            cashFlow={financialReports.cashFlow}
          />
        )}
        
        {/* Quick links and service navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">General Ledger</h2>
            <div className="space-y-2">
              <Link href="/dashboard/accounts" className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <span className="font-medium">Chart of Accounts</span>
                <p className="text-sm text-gray-500">Manage your account structure</p>
              </Link>
              <Link href="/dashboard/journal-entries" className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <span className="font-medium">Journal Entries</span>
                <p className="text-sm text-gray-500">View and record transactions</p>
              </Link>
              <Link href="/dashboard/reports/balance-sheet" className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <span className="font-medium">Balance Sheet</span>
                <p className="text-sm text-gray-500">View your financial position</p>
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <div className="space-y-2">
              <Link href="/dashboard/reports/income-statement" className="block p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                <span className="font-medium">Income Statement</span>
                <p className="text-sm text-gray-500">View your profitability</p>
              </Link>
              <Link href="/dashboard/reports/cash-flow" className="block p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                <span className="font-medium">Cash Flow</span>
                <p className="text-sm text-gray-500">Track your cash movements</p>
              </Link>
              <Link href="/dashboard/reports/consolidated" className="block p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                <span className="font-medium">Consolidated Reports</span>
                <p className="text-sm text-gray-500">View combined financial data</p>
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3 py-2">
                <p className="text-sm font-medium">New report available</p>
                <p className="text-xs text-gray-500">Q2 Financial Statement is ready for review</p>
                <button className="mt-1 text-xs text-blue-600 hover:text-blue-800">View Report</button>
              </div>
              
              <div className="border-l-4 border-green-500 pl-3 py-2">
                <p className="text-sm font-medium">Account reconciled</p>
                <p className="text-xs text-gray-500">Checking account has been reconciled</p>
                <button className="mt-1 text-xs text-blue-600 hover:text-blue-800">View Account</button>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-3 py-2">
                <p className="text-sm font-medium">Pending transactions</p>
                <p className="text-xs text-gray-500">3 transactions need your approval</p>
                <button className="mt-1 text-xs text-blue-600 hover:text-blue-800">Review</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent activity timeline */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="bg-blue-500 rounded-full h-3 w-3"></div>
                <div className="bg-gray-200 flex-grow w-px"></div>
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">Income Statement Updated</p>
                <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                <p className="text-sm mt-1">Monthly income statement was generated with updated data</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="bg-green-500 rounded-full h-3 w-3"></div>
                <div className="bg-gray-200 flex-grow w-px"></div>
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">New Journal Entry</p>
                <p className="text-xs text-gray-500">Yesterday, 2:15 PM</p>
                <p className="text-sm mt-1">Invoice #1234 was recorded</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="bg-purple-500 rounded-full h-3 w-3"></div>
                <div className="bg-gray-200 flex-grow w-px"></div>
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">Account Added</p>
                <p className="text-xs text-gray-500">Mar 15, 2024</p>
                <p className="text-sm mt-1">New expense account was created</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 