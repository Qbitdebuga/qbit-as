"use client";

import { useState } from 'react';
import { 
  IncomeStatementDto, 
  IncomeStatementSection,
  IncomeStatementAccount 
} from '@qbit/shared-types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Printer } from 'lucide-react';
import { exportToCsv, exportToExcel, exportToPdf } from '@/utils/report-export';
import { formatCurrency } from '@/utils/format';

interface IncomeStatementReportProps {
  report: IncomeStatementDto;
}

export function IncomeStatementReport({ report }: IncomeStatementReportProps) {
  const [activeView, setActiveView] = useState<'structured' | 'detailed'>('structured');
  
  const handleExportToCsv = () => {
    exportToCsv(report);
  };
  
  const handleExportToExcel = () => {
    exportToExcel(report);
  };
  
  const handleExportToPdf = () => {
    exportToPdf(report);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Card className="w-full print:shadow-none">
      <CardHeader className="pb-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Income Statement</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToCsv}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToExcel}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToPdf}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
        
        <Tabs
          value={activeView} 
          onValueChange={(v: string) => setActiveView(v as 'structured' | 'detailed')}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="structured">Structured View</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center print:mb-4">
          <h2 className="text-2xl font-bold print:text-xl">{report.meta.title}</h2>
          <p className="text-muted-foreground">For the period {report.meta.startDate} to {report.meta.endDate}</p>
        </div>
        
        <Tabs value={activeView} className="w-full">
          <TabsContent value="structured" className="mt-0">
            <StructuredView report={report} />
          </TabsContent>
          <TabsContent value="detailed" className="mt-0">
            <DetailedView report={report} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StructuredView({ report }: { report: IncomeStatementDto }) {
  const { data, meta } = report;
  const hasComparative = meta.comparativePeriod;
  
  return (
    <div className="space-y-8 print:space-y-4">
      {/* Revenue */}
      <div>
        <h3 className="text-lg font-semibold mb-2 print:text-base">Revenue</h3>
        {data.revenue.map((section, index) => (
          <div key={`revenue-section-${index}`} className="mb-4 print:mb-2">
            <h4 className="text-md font-medium mb-1 print:text-sm">{section.title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Account</TableHead>
                  {hasComparative ? (
                    <>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right">Amount</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.accounts.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    {hasComparative ? (
                      <>
                        <TableCell className="text-right">{formatCurrency(account.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.previousAmount || 0)}</TableCell>
                        <TableCell className={`text-right ${(account.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.change || 0)}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-right">{formatCurrency(account.amount)}</TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total {section.title}</TableCell>
                  <TableCell colSpan={hasComparative ? 3 : 1} className="text-right">
                    {formatCurrency(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="text-right font-semibold mt-2 p-2 bg-muted">
          Total Revenue: {formatCurrency(data.totalRevenue)}
        </div>
      </div>
      
      {/* Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-2 print:text-base">Expenses</h3>
        {data.expenses.map((section, index) => (
          <div key={`expense-section-${index}`} className="mb-4 print:mb-2">
            <h4 className="text-md font-medium mb-1 print:text-sm">{section.title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Account</TableHead>
                  {hasComparative ? (
                    <>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right">Amount</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.accounts.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    {hasComparative ? (
                      <>
                        <TableCell className="text-right">{formatCurrency(account.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.previousAmount || 0)}</TableCell>
                        <TableCell className={`text-right ${(account.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.change || 0)}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-right">{formatCurrency(account.amount)}</TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total {section.title}</TableCell>
                  <TableCell colSpan={hasComparative ? 3 : 1} className="text-right">
                    {formatCurrency(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="text-right font-semibold mt-2 p-2 bg-muted">
          Total Expenses: {formatCurrency(data.totalExpenses)}
        </div>
      </div>
      
      {/* Net Income */}
      <div className="text-right font-bold p-3 bg-muted/80">
        Net Income: {formatCurrency(data.netIncome)}
      </div>
      
      {/* Comparative data if available */}
      {hasComparative && data.previousNetIncome !== undefined && (
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-muted p-2 rounded-md">
            <p className="font-medium">Previous Net Income:</p>
            <p className="text-lg font-semibold">{formatCurrency(data.previousNetIncome)}</p>
          </div>
          
          {data.netIncomeChange !== undefined && (
            <div className={`p-2 rounded-md ${data.netIncomeChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">Net Income Change:</p>
              <p className="text-lg font-semibold">
                {formatCurrency(data.netIncomeChange)}
                {data.netIncomeChangePercentage !== undefined && data.netIncomeChangePercentage !== null && (
                  <span className="text-sm ml-2">
                    ({data.netIncomeChangePercentage >= 0 ? '+' : ''}{data.netIncomeChangePercentage.toFixed(2)}%)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailedView({ report }: { report: IncomeStatementDto }) {
  const { data, meta } = report;
  const hasComparative = meta.comparativePeriod;
  
  // Flatten all accounts for detailed view
  const allAccounts: Array<{ 
    section: string, 
    category: 'Revenue' | 'Expenses', 
    account: IncomeStatementAccount 
  }> = [];
  
  data.revenue.forEach(section => {
    section.accounts.forEach(account => {
      allAccounts.push({ 
        section: section.title, 
        category: 'Revenue', 
        account 
      });
    });
  });
  
  data.expenses.forEach(section => {
    section.accounts.forEach(account => {
      allAccounts.push({ 
        section: section.title, 
        category: 'Expenses', 
        account 
      });
    });
  });
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>Account Name</TableHead>
            {hasComparative ? (
              <>
                <TableHead className="text-right">Current Amount</TableHead>
                <TableHead className="text-right">Previous Amount</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Change %</TableHead>
              </>
            ) : (
              <TableHead className="text-right">Amount</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAccounts.map((item, index) => (
            <TableRow key={`detailed-account-${index}`}>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.section}</TableCell>
              <TableCell>{item.account.accountCode}</TableCell>
              <TableCell>{item.account.accountName}</TableCell>
              {hasComparative ? (
                <>
                  <TableCell className="text-right">{formatCurrency(item.account.amount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.account.previousAmount || 0)}</TableCell>
                  <TableCell className={`text-right ${(item.account.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.account.change || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.account.changePercentage !== undefined && item.account.changePercentage !== null
                      ? `${item.account.changePercentage.toFixed(2)}%` 
                      : '-'}
                  </TableCell>
                </>
              ) : (
                <TableCell className="text-right">{formatCurrency(item.account.amount)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 space-y-2">
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Total Revenue:</span>
          <span>{formatCurrency(data.totalRevenue)}</span>
        </div>
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Total Expenses:</span>
          <span>{formatCurrency(data.totalExpenses)}</span>
        </div>
        <div className="flex justify-between p-3 bg-muted/80 font-bold">
          <span>Net Income:</span>
          <span>{formatCurrency(data.netIncome)}</span>
        </div>
        
        {hasComparative && data.previousNetIncome !== undefined && (
          <>
            <div className="flex justify-between p-2 bg-muted">
              <span className="font-semibold">Previous Net Income:</span>
              <span>{formatCurrency(data.previousNetIncome)}</span>
            </div>
            {data.netIncomeChange !== undefined && (
              <div className="flex justify-between p-2 bg-muted">
                <span className="font-semibold">Net Income Change:</span>
                <span className={data.netIncomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(data.netIncomeChange)}
                  {data.netIncomeChangePercentage !== undefined && data.netIncomeChangePercentage !== null && (
                    <span className="ml-2">
                      ({data.netIncomeChangePercentage >= 0 ? '+' : ''}{data.netIncomeChangePercentage.toFixed(2)}%)
                    </span>
                  )}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 