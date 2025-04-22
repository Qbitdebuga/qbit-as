"use client";

import { useState } from 'react';
import { 
  CashFlowStatementDto, 
  CashFlowSection,
  CashFlowItem 
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

interface CashFlowReportProps {
  report: CashFlowStatementDto;
}

export function CashFlowReport({ report }: CashFlowReportProps) {
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
          <CardTitle>Cash Flow Statement</CardTitle>
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

function StructuredView({ report }: { report: CashFlowStatementDto }) {
  const { data } = report;
  
  return (
    <div className="space-y-8 print:space-y-4">
      {/* Cash from Operating Activities */}
      <div>
        <h3 className="text-lg font-semibold mb-2 print:text-base">Cash Flows from Operating Activities</h3>
        {data.operatingActivities.map((section, index) => (
          <div key={`operating-section-${index}`} className="mb-4 print:mb-2">
            <h4 className="text-md font-medium mb-1 print:text-sm">{section.title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => (
                  <TableRow key={`operating-item-${itemIndex}`}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total {section.title}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="text-right font-semibold mt-2 p-2 bg-muted">
          Net Cash from Operating Activities: {formatCurrency(data.netCashFromOperatingActivities)}
        </div>
      </div>
      
      {/* Cash from Investing Activities */}
      <div>
        <h3 className="text-lg font-semibold mb-2 print:text-base">Cash Flows from Investing Activities</h3>
        {data.investingActivities.map((section, index) => (
          <div key={`investing-section-${index}`} className="mb-4 print:mb-2">
            <h4 className="text-md font-medium mb-1 print:text-sm">{section.title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => (
                  <TableRow key={`investing-item-${itemIndex}`}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total {section.title}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="text-right font-semibold mt-2 p-2 bg-muted">
          Net Cash from Investing Activities: {formatCurrency(data.netCashFromInvestingActivities)}
        </div>
      </div>
      
      {/* Cash from Financing Activities */}
      <div>
        <h3 className="text-lg font-semibold mb-2 print:text-base">Cash Flows from Financing Activities</h3>
        {data.financingActivities.map((section, index) => (
          <div key={`financing-section-${index}`} className="mb-4 print:mb-2">
            <h4 className="text-md font-medium mb-1 print:text-sm">{section.title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => (
                  <TableRow key={`financing-item-${itemIndex}`}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total {section.title}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="text-right font-semibold mt-2 p-2 bg-muted">
          Net Cash from Financing Activities: {formatCurrency(data.netCashFromFinancingActivities)}
        </div>
      </div>
      
      {/* Summary */}
      <div className="space-y-2 mt-6">
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Net Change in Cash:</span>
          <span className={data.netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(data.netChangeInCash)}
          </span>
        </div>
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Beginning Cash Balance:</span>
          <span>{formatCurrency(data.beginningCash)}</span>
        </div>
        <div className="flex justify-between p-3 bg-muted/80 font-bold">
          <span>Ending Cash Balance:</span>
          <span>{formatCurrency(data.endingCash)}</span>
        </div>
      </div>
    </div>
  );
}

function DetailedView({ report }: { report: CashFlowStatementDto }) {
  const { data } = report;
  
  // Flatten all items for detailed view
  const allItems: Array<{ 
    section: string, 
    category: 'Operating' | 'Investing' | 'Financing', 
    item: CashFlowItem 
  }> = [];
  
  data.operatingActivities.forEach(section => {
    section.items.forEach(item => {
      allItems.push({ 
        section: section.title, 
        category: 'Operating', 
        item 
      });
    });
  });
  
  data.investingActivities.forEach(section => {
    section.items.forEach(item => {
      allItems.push({ 
        section: section.title, 
        category: 'Investing', 
        item 
      });
    });
  });
  
  data.financingActivities.forEach(section => {
    section.items.forEach(item => {
      allItems.push({ 
        section: section.title, 
        category: 'Financing', 
        item 
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
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item, index) => (
            <TableRow key={`detailed-item-${index}`}>
              <TableCell>{item.category} Activities</TableCell>
              <TableCell>{item.section}</TableCell>
              <TableCell>{item.item.description}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.item.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 space-y-2">
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Net Cash from Operating Activities:</span>
          <span>{formatCurrency(data.netCashFromOperatingActivities)}</span>
        </div>
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Net Cash from Investing Activities:</span>
          <span>{formatCurrency(data.netCashFromInvestingActivities)}</span>
        </div>
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Net Cash from Financing Activities:</span>
          <span>{formatCurrency(data.netCashFromFinancingActivities)}</span>
        </div>
        <div className="flex justify-between p-2 bg-muted font-semibold">
          <span>Net Change in Cash:</span>
          <span className={data.netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(data.netChangeInCash)}
          </span>
        </div>
        <div className="flex justify-between p-2 bg-muted">
          <span className="font-semibold">Beginning Cash Balance:</span>
          <span>{formatCurrency(data.beginningCash)}</span>
        </div>
        <div className="flex justify-between p-3 bg-muted/80 font-bold">
          <span>Ending Cash Balance:</span>
          <span>{formatCurrency(data.endingCash)}</span>
        </div>
      </div>
    </div>
  );
} 