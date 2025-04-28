'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format';

interface ConsolidatedReportSummaryProps {
  balanceSheet: any;
  incomeStatement: any;
  cashFlow: any;
  showTitle?: boolean;
  showLinks?: boolean;
}

const ConsolidatedReportSummary: React.FC<ConsolidatedReportSummaryProps> = ({
  balanceSheet,
  incomeStatement,
  cashFlow,
  showTitle = true,
  showLinks = true
}) => {
  if (!balanceSheet && !incomeStatement && !cashFlow) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
        No financial data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Financial Overview</h2>
          {showLinks && (
            <Link href="/dashboard/reports/consolidated" className="text-sm text-blue-600 hover:text-blue-800">
              View Full Report
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {/* Balance Sheet Summary */}
        {balanceSheet && (
          <div className="bg-blue-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-blue-700">Balance Sheet</h3>
              {showLinks && (
                <Link href="/dashboard/reports/balance-sheet" className="text-xs text-blue-600 hover:text-blue-800">
                  View
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Assets:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liabilities:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalLiabilities)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Equity:</span>
                  <span className="font-medium">{formatCurrency(balanceSheet.data.totalEquity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Debt/Equity:</span>
                  <span className="font-medium">
                    {balanceSheet.data.totalEquity ? 
                      (balanceSheet.data.totalLiabilities / balanceSheet.data.totalEquity).toFixed(2) : 
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Income Statement Summary */}
        {incomeStatement && (
          <div className="bg-green-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-green-700">Income Statement</h3>
              {showLinks && (
                <Link href="/dashboard/reports/income-statement" className="text-xs text-green-600 hover:text-green-800">
                  View
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.totalExpenses)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Net Income:</span>
                  <span className="font-medium">{formatCurrency(incomeStatement.data.netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-medium">
                    {incomeStatement.data.totalRevenue ? 
                      ((incomeStatement.data.netIncome / incomeStatement.data.totalRevenue) * 100).toFixed(2) + '%' : 
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Cash Flow Summary */}
        {cashFlow && (
          <div className="bg-amber-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-amber-700">Cash Flow</h3>
              {showLinks && (
                <Link href="/dashboard/reports/cash-flow" className="text-xs text-amber-600 hover:text-amber-800">
                  View
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Operating:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netCashFromOperatingActivities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investing:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netCashFromInvestingActivities)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Financing:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netCashFromFinancingActivities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Change:</span>
                  <span className="font-medium">{formatCurrency(cashFlow.data.netChangeInCash)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Key Ratios */}
        {balanceSheet && incomeStatement && (
          <div className="bg-indigo-50 rounded p-3">
            <h3 className="text-sm font-medium text-indigo-700 mb-2">Key Ratios</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">ROA:</span>
                <span className="font-medium">
                  {balanceSheet.data.totalAssets ? 
                    ((incomeStatement.data.netIncome / balanceSheet.data.totalAssets) * 100).toFixed(2) + '%' : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROE:</span>
                <span className="font-medium">
                  {balanceSheet.data.totalEquity ? 
                    ((incomeStatement.data.netIncome / balanceSheet.data.totalEquity) * 100).toFixed(2) + '%' : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Ratio:</span>
                <span className="font-medium">1.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quick Ratio:</span>
                <span className="font-medium">1.2</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedReportSummary; 