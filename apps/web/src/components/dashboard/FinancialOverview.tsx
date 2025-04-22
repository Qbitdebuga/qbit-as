'use client';

import React, { useEffect, useState } from 'react';
import { useAggregatedData, UserFinancialOverview } from '../../hooks/useAggregatedData';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/format';

export const FinancialOverview: React.FC = () => {
  const { getUserFinancialOverview, getDashboardSummary, loading, error } = useAggregatedData();
  const [data, setData] = useState<UserFinancialOverview | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the financial overview and summary data concurrently
        const [overview, summary] = await Promise.all([
          getUserFinancialOverview(),
          getDashboardSummary()
        ]);
        
        if (overview) {
          setData(overview);
        }
        
        if (summary) {
          setSummaryData(summary);
        }
      } catch (err) {
        console.error('Failed to fetch financial overview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getUserFinancialOverview, getDashboardSummary]);

  if (isLoading || loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-100">
              <div className="h-4 bg-gray-200 rounded w-2/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600 text-sm mt-1">
            {error.message || 'Failed to load financial overview data'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { balanceSheet, incomeStatement, cashFlow, user } = data;

  return (
    <div className="space-y-6">
      {/* User welcome section */}
      {user && (
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm text-white">
          <h2 className="text-xl font-semibold">Welcome back, {user.name}</h2>
          <p className="text-blue-100">Here's an overview of your financial data</p>
        </div>
      )}
      
      {/* Key financial metrics */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <h3 className="text-sm font-medium text-blue-600">Total Assets</h3>
            <p className="text-xl font-semibold">{formatCurrency(balanceSheet?.totalAssets)}</p>
            {summaryData?.assetGrowth && (
              <p className={`text-xs mt-1 ${summaryData.assetGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryData.assetGrowth > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(summaryData.assetGrowth))} from last month
              </p>
            )}
          </div>
          
          <div className="p-4 rounded-lg bg-red-50 border border-red-100">
            <h3 className="text-sm font-medium text-red-600">Total Liabilities</h3>
            <p className="text-xl font-semibold">{formatCurrency(balanceSheet?.totalLiabilities)}</p>
            {summaryData?.liabilityChange && (
              <p className={`text-xs mt-1 ${summaryData.liabilityChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryData.liabilityChange < 0 ? '↓' : '↑'} {formatPercentage(Math.abs(summaryData.liabilityChange))} from last month
              </p>
            )}
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <h3 className="text-sm font-medium text-green-600">Net Worth</h3>
            <p className="text-xl font-semibold">{formatCurrency(balanceSheet?.equity)}</p>
            {summaryData?.equityChange && (
              <p className={`text-xs mt-1 ${summaryData.equityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryData.equityChange > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(summaryData.equityChange))} from last month
              </p>
            )}
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
            <h3 className="text-sm font-medium text-purple-600">Monthly Income</h3>
            <p className="text-xl font-semibold">{formatCurrency(incomeStatement?.netIncome)}</p>
            {summaryData?.incomeChange && (
              <p className={`text-xs mt-1 ${summaryData.incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryData.incomeChange > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(summaryData.incomeChange))} from last month
              </p>
            )}
          </div>
        </div>
        
        {/* Additional metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <h3 className="text-sm font-medium text-amber-600">Cash Flow</h3>
            <p className="text-xl font-semibold">{formatCurrency(cashFlow?.netCashFlow)}</p>
            <div className="flex flex-wrap mt-2 text-xs gap-2">
              <span className="px-2 py-1 bg-amber-100 rounded-full text-amber-700">
                Operating: {formatCurrency(cashFlow?.operatingCashFlow)}
              </span>
              <span className="px-2 py-1 bg-amber-100 rounded-full text-amber-700">
                Investing: {formatCurrency(cashFlow?.investingCashFlow)}
              </span>
              <span className="px-2 py-1 bg-amber-100 rounded-full text-amber-700">
                Financing: {formatCurrency(cashFlow?.financingCashFlow)}
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-600">Revenue</h3>
            <p className="text-xl font-semibold">{formatCurrency(incomeStatement?.revenue)}</p>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ 
                  width: incomeStatement?.revenue && incomeStatement?.expenses ? 
                    `${Math.min(100, (incomeStatement.revenue / (incomeStatement.revenue + incomeStatement.expenses)) * 100)}%` : '0%' 
                }}></div>
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-500">
              Profit margin: {incomeStatement?.revenue && incomeStatement?.netIncome ? 
                formatPercentage(incomeStatement.netIncome / incomeStatement.revenue * 100) : '0%'}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
            <h3 className="text-sm font-medium text-rose-600">Expenses</h3>
            <p className="text-xl font-semibold">{formatCurrency(incomeStatement?.expenses)}</p>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-rose-600 h-2 rounded-full" style={{ 
                  width: incomeStatement?.revenue && incomeStatement?.expenses ? 
                    `${Math.min(100, (incomeStatement.expenses / (incomeStatement.revenue + incomeStatement.expenses)) * 100)}%` : '0%' 
                }}></div>
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-500">
              Expense ratio: {incomeStatement?.revenue && incomeStatement?.expenses ? 
                formatPercentage(incomeStatement.expenses / incomeStatement.revenue * 100) : '0%'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent transactions */}
      {data.recentTransactions && data.recentTransactions.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Recent Transactions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-sm text-gray-600">{transaction.description}</td>
                    <td className={`py-3 px-3 text-sm text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${transaction.type === 'INCOME' ? 'bg-green-100 text-green-800' : 
                          transaction.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview; 