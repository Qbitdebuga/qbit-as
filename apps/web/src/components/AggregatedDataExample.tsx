'use client';

import React from 'react';
import { useAggregatedData } from '@/hooks/useAggregatedData';
import { formatCurrency } from '@/utils/format';

const AggregatedDataExample: React.FC = () => {
  const {
    getUserFinancialOverview,
    getAccountWithTransactions,
    getFinancialStatements,
    getDashboardSummary,
  } = useAggregatedData();

  const [overviewData, setOverviewData] = React.useState(null);
  const [accountData, setAccountData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Example function to load overview data
  const loadOverviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserFinancialOverview();
      setOverviewData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview data');
    } finally {
      setIsLoading(false);
    }
  };

  // Example function to load account details
  const loadAccountDetails = async (accountId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAccountWithTransactions(accountId);
      setAccountData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Financial Data Dashboard</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={loadOverviewData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          Load Financial Overview
        </button>

        <button
          onClick={() => loadAccountDetails('example-account-id')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isLoading}
        >
          Load Example Account
        </button>
      </div>

      {isLoading && <p className="text-gray-500">Loading data...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {overviewData && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-semibold mb-2">Financial Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="font-medium">
                {formatCurrency(overviewData.balanceSheet?.totalAssets)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Liabilities</p>
              <p className="font-medium">
                {formatCurrency(overviewData.balanceSheet?.totalLiabilities)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Worth</p>
              <p className="font-medium">{formatCurrency(overviewData.balanceSheet?.equity)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="font-medium">
                {formatCurrency(overviewData.incomeStatement?.netIncome)}
              </p>
            </div>
          </div>
        </div>
      )}

      {accountData && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Account Details</h3>
          <p>
            <span className="text-gray-600">Account Name:</span> {accountData.account?.name}
          </p>
          <p>
            <span className="text-gray-600">Current Balance:</span>{' '}
            {formatCurrency(accountData.account?.balance)}
          </p>

          {accountData.transactions && accountData.transactions.length > 0 && (
            <>
              <h4 className="font-medium mt-3 mb-2">Recent Transactions</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 text-left text-sm">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {accountData.transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 px-3">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">{transaction.description}</td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AggregatedDataExample;
