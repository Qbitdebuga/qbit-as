'use client';

import React, { useEffect, useState } from 'react';
import { useAggregatedData } from '@/hooks/useAggregatedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  BarChart2,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';

const FinancialOverview: React.FC = () => {
  const { getUserFinancialOverview, getDashboardSummary, loading, error } = useAggregatedData();

  const [financialData, setFinancialData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Load financial overview data
        const financialOverview = await getUserFinancialOverview();
        if (financialOverview) {
          setFinancialData(financialOverview);
        }

        // Load dashboard summary data
        const dashboardSummary = await getDashboardSummary();
        if (dashboardSummary) {
          setDashboardData(dashboardSummary);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch financial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getUserFinancialOverview, getDashboardSummary]);

  if (isLoading || loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading financial overview...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || error) {
    return (
      <div className="w-full p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading financial data</p>
          <p className="text-sm">
            {errorMessage || (error instanceof Error ? error.message : 'Unknown error')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>

      {/* User info and welcome message */}
      {financialData?.user && (
        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-medium">Welcome, {financialData.user.name}</h3>
          <p className="text-muted-foreground">
            Here's your financial overview as of {new Date().toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Key financial metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.balanceSheet?.totalAssets || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData?.financialSummary?.totalAccounts || 0} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.balanceSheet?.totalLiabilities || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance calculation from all liability accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.balanceSheet?.equity || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Assets minus Liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.incomeStatement?.netIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Net income for the current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Current month comparison</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <div className="text-sm font-medium">Revenue</div>
                    </div>
                    <div className="ml-auto font-bold">
                      {formatCurrency(financialData?.incomeStatement?.revenue || 0)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      <div className="text-sm font-medium">Expenses</div>
                    </div>
                    <div className="ml-auto font-bold">
                      {formatCurrency(financialData?.incomeStatement?.expenses || 0)}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <div className="text-sm font-medium">Net Income</div>
                    </div>
                    <div className="ml-auto font-bold">
                      {formatCurrency(financialData?.incomeStatement?.netIncome || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Cash Position</span>
                    </div>
                    <div className="ml-auto flex items-center">
                      <span className="font-medium">
                        {formatCurrency(dashboardData?.cashPosition || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Profitability Ratio</span>
                    </div>
                    <div className="ml-auto flex items-center">
                      <span className="font-medium">
                        {dashboardData?.profitabilityRatio?.toFixed(2) || '0.00'}%
                      </span>
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Debt to Equity</span>
                    </div>
                    <div className="ml-auto flex items-center">
                      <span className="font-medium">
                        {dashboardData?.debtToEquityRatio?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {financialData?.financialSummary?.recentTransactions &&
              financialData.financialSummary.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {financialData.financialSummary.recentTransactions.map(
                    (transaction: any, i: number) => (
                      <div key={i} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Overview of your account balances</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.accountSummaries && dashboardData.accountSummaries.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.accountSummaries.map((account: any, i: number) => (
                    <div key={i} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.type}</p>
                      </div>
                      <div className="ml-auto font-medium">{formatCurrency(account.balance)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No accounts found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialOverview;
