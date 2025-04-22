'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '../../utils/format';
import { exportToCsv, exportToExcel, exportToPdf } from '../../utils/report-export';

interface ConsolidatedReportProps {
  balanceSheet: any;
  incomeStatement: any;
  cashFlow: any;
  asOfDate: string;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
}

const ConsolidatedReport: React.FC<ConsolidatedReportProps> = ({
  balanceSheet,
  incomeStatement,
  cashFlow,
  asOfDate,
  onExport
}) => {
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (onExport) {
      onExport(format);
      return;
    }

    // Default export implementation if no custom handler is provided
    const fileName = `consolidated-report-${asOfDate}`;
    
    if (format === 'pdf' && balanceSheet) {
      exportToPdf(balanceSheet, `${fileName}-balance-sheet.pdf`);
    } else if (format === 'excel' && balanceSheet) {
      exportToExcel(balanceSheet, `${fileName}-balance-sheet.xlsx`);
    } else if (format === 'csv' && balanceSheet) {
      exportToCsv(balanceSheet, `${fileName}-balance-sheet.csv`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary panel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {balanceSheet && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Balance Sheet</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Assets:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Liabilities:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalLiabilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Equity:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalEquity)}</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/reports/balance-sheet" className="text-xs text-blue-600 hover:text-blue-800">
                  View Full Balance Sheet
                </Link>
              </div>
            </div>
          )}
          
          {incomeStatement && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">Income Statement</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Expenses:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Income:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.netIncome)}</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/reports/income-statement" className="text-xs text-green-600 hover:text-green-800">
                  View Full Income Statement
                </Link>
              </div>
            </div>
          )}
          
          {cashFlow && (
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="text-sm font-medium text-amber-800 mb-2">Cash Flow</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Operating Activities:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netCashFromOperatingActivities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Investing Activities:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netCashFromInvestingActivities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Change in Cash:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netChangeInCash)}</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/reports/cash-flow" className="text-xs text-amber-600 hover:text-amber-800">
                  View Full Cash Flow Statement
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Financial ratios */}
      {incomeStatement && balanceSheet && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Key Financial Ratios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Profitability */}
            <div className="p-3 bg-indigo-50 rounded-lg">
              <h3 className="text-xs font-medium text-indigo-800 uppercase mb-2">Profit Margin</h3>
              <p className="text-lg font-semibold">
                {incomeStatement.data.totalRevenue ? 
                  ((incomeStatement.data.netIncome / incomeStatement.data.totalRevenue) * 100).toFixed(2) + '%' : 
                  'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net Income / Revenue</p>
            </div>
            
            {/* Liquidity */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="text-xs font-medium text-blue-800 uppercase mb-2">Debt-to-Equity Ratio</h3>
              <p className="text-lg font-semibold">
                {balanceSheet.data.totalEquity ? 
                  (balanceSheet.data.totalLiabilities / balanceSheet.data.totalEquity).toFixed(2) : 
                  'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Liabilities / Total Equity</p>
            </div>
            
            {/* Return on Assets */}
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="text-xs font-medium text-green-800 uppercase mb-2">Return on Assets</h3>
              <p className="text-lg font-semibold">
                {balanceSheet.data.totalAssets ? 
                  ((incomeStatement.data.netIncome / balanceSheet.data.totalAssets) * 100).toFixed(2) + '%' : 
                  'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net Income / Total Assets</p>
            </div>
            
            {/* Return on Equity */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="text-xs font-medium text-purple-800 uppercase mb-2">Return on Equity</h3>
              <p className="text-lg font-semibold">
                {balanceSheet.data.totalEquity ? 
                  ((incomeStatement.data.netIncome / balanceSheet.data.totalEquity) * 100).toFixed(2) + '%' : 
                  'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net Income / Total Equity</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Report metadata */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Report Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Report Period</h3>
            <div className="bg-gray-50 p-3 rounded">
              {balanceSheet && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">As of Date:</span>
                    <span className="text-sm">{formatDate(balanceSheet.meta.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Generated At:</span>
                    <span className="text-sm">{formatDate(balanceSheet.meta.generatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Data Sources</h3>
            <div className="bg-gray-50 p-3 rounded">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span>General Ledger Service</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  <span>Reporting Service</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  <span>Auth Service</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export options */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Export Options</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
            disabled={!balanceSheet}
          >
            Export to PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
            disabled={!balanceSheet}
          >
            Export to Excel
          </button>
          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            disabled={!balanceSheet}
          >
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReport; 