import { 
  BalanceSheetStatementDto, 
  IncomeStatementDto, 
  CashFlowStatementDto 
} from '@qbit/shared-types';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

type ReportType = 
  BalanceSheetStatementDto | 
  IncomeStatementDto | 
  CashFlowStatementDto;

/**
 * Export a financial report to CSV format
 */
export function exportToCsv(report: ReportType, fileName?: string): void {
  const reportType = report.meta.reportType;
  const formattedDate = format(new Date(), 'yyyy-MM-dd');
  const defaultFileName = `${reportType.toLowerCase().replace('_', '-')}-${formattedDate}.csv`;
  
  const csvContent = convertReportToCsv(report);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
  saveAs(blob, fileName || defaultFileName);
}

/**
 * Export a financial report to PDF
 * Note: This is a placeholder; actual PDF generation would typically
 * use a library like jsPDF or server-side rendering
 */
export function exportToPdf(report: ReportType, fileName?: string): void {
  // PDF export would be implemented here using a library like jsPDF
  console.warn('PDF export is not implemented yet');
  
  // For now, export to CSV as a fallback
  exportToCsv(report, fileName);
}

/**
 * Export a financial report to Excel format
 * Note: This is a simplified version; a real implementation would use
 * a library like ExcelJS or xlsx for proper Excel formatting
 */
export function exportToExcel(report: ReportType, fileName?: string): void {
  // For a basic implementation, we'll just use CSV with an .xlsx extension
  const reportType = report.meta.reportType;
  const formattedDate = format(new Date(), 'yyyy-MM-dd');
  const defaultFileName = `${reportType.toLowerCase().replace('_', '-')}-${formattedDate}.xlsx`;
  
  const csvContent = convertReportToCsv(report);
  const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, fileName || defaultFileName);
}

/**
 * Convert a financial report to CSV format
 */
function convertReportToCsv(report: ReportType): string {
  let csvRows: string[] = [];
  
  // Add report title and metadata
  csvRows.push(`"${report.meta.title}"`);
  csvRows.push(`"Period: ${report.meta.startDate} to ${report.meta.endDate}"`);
  csvRows.push(`"Generated: ${report.meta.generatedAt}"`);
  csvRows.push(''); // Empty row for spacing
  
  if (isBalanceSheet(report)) {
    // Process balance sheet
    csvRows = [...csvRows, ...processBalanceSheet(report)];
  } else if (isIncomeStatement(report)) {
    // Process income statement
    csvRows = [...csvRows, ...processIncomeStatement(report)];
  } else if (isCashFlowStatement(report)) {
    // Process cash flow statement
    csvRows = [...csvRows, ...processCashFlowStatement(report)];
  }
  
  return csvRows.join('\n');
}

function isBalanceSheet(report: ReportType): report is BalanceSheetStatementDto {
  return report.meta.reportType === 'BALANCE_SHEET';
}

function isIncomeStatement(report: ReportType): report is IncomeStatementDto {
  return report.meta.reportType === 'INCOME_STATEMENT';
}

function isCashFlowStatement(report: ReportType): report is CashFlowStatementDto {
  return report.meta.reportType === 'CASH_FLOW_STATEMENT';
}

function processBalanceSheet(report: BalanceSheetStatementDto): string[] {
  const csvRows: string[] = [];
  
  // Add headers based on comparative data
  if (report.meta.comparativePeriod) {
    csvRows.push('"Account Code","Account Name","Current Balance","Previous Balance","Change","Change %"');
  } else {
    csvRows.push('"Account Code","Account Name","Balance"');
  }
  
  // Add assets section
  csvRows.push('"ASSETS"');
  report.data.assets.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.accounts.forEach(account => {
      if (report.meta.comparativePeriod && account.previousBalance !== undefined) {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}",` +
          `"${formatCurrency(account.previousBalance)}","${formatCurrency(account.change || 0)}",` +
          `"${formatPercentage(account.changePercentage)}"`
        );
      } else {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}"`
        );
      }
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"TOTAL ASSETS","","${formatCurrency(report.data.totalAssets)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add liabilities section
  csvRows.push('"LIABILITIES"');
  report.data.liabilities.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.accounts.forEach(account => {
      if (report.meta.comparativePeriod && account.previousBalance !== undefined) {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}",` +
          `"${formatCurrency(account.previousBalance)}","${formatCurrency(account.change || 0)}",` +
          `"${formatPercentage(account.changePercentage)}"`
        );
      } else {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}"`
        );
      }
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"TOTAL LIABILITIES","","${formatCurrency(report.data.totalLiabilities)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add equity section
  csvRows.push('"EQUITY"');
  report.data.equity.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.accounts.forEach(account => {
      if (report.meta.comparativePeriod && account.previousBalance !== undefined) {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}",` +
          `"${formatCurrency(account.previousBalance)}","${formatCurrency(account.change || 0)}",` +
          `"${formatPercentage(account.changePercentage)}"`
        );
      } else {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.balance)}"`
        );
      }
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"TOTAL EQUITY","","${formatCurrency(report.data.totalEquity)}"`);
  csvRows.push(''); // Empty row for spacing
  
  csvRows.push(`"TOTAL LIABILITIES AND EQUITY","","${formatCurrency(report.data.totalLiabilitiesAndEquity)}"`);
  
  return csvRows;
}

function processIncomeStatement(report: IncomeStatementDto): string[] {
  const csvRows: string[] = [];
  
  // Add headers based on comparative data
  if (report.meta.comparativePeriod) {
    csvRows.push('"Account Code","Account Name","Current Amount","Previous Amount","Change","Change %"');
  } else {
    csvRows.push('"Account Code","Account Name","Amount"');
  }
  
  // Add revenue section
  csvRows.push('"REVENUE"');
  report.data.revenue.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.accounts.forEach(account => {
      if (report.meta.comparativePeriod && account.previousAmount !== undefined) {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.amount)}",` +
          `"${formatCurrency(account.previousAmount)}","${formatCurrency(account.change || 0)}",` +
          `"${formatPercentage(account.changePercentage)}"`
        );
      } else {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.amount)}"`
        );
      }
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"TOTAL REVENUE","","${formatCurrency(report.data.totalRevenue)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add expenses section
  csvRows.push('"EXPENSES"');
  report.data.expenses.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.accounts.forEach(account => {
      if (report.meta.comparativePeriod && account.previousAmount !== undefined) {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.amount)}",` +
          `"${formatCurrency(account.previousAmount)}","${formatCurrency(account.change || 0)}",` +
          `"${formatPercentage(account.changePercentage)}"`
        );
      } else {
        csvRows.push(
          `"${account.accountCode}","${account.accountName}","${formatCurrency(account.amount)}"`
        );
      }
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"TOTAL EXPENSES","","${formatCurrency(report.data.totalExpenses)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add net income
  csvRows.push(`"NET INCOME","","${formatCurrency(report.data.netIncome)}"`);
  
  if (report.meta.comparativePeriod && report.data.previousNetIncome !== undefined) {
    csvRows.push(
      `"Previous Net Income","","${formatCurrency(report.data.previousNetIncome)}"`
    );
    
    if (report.data.netIncomeChange !== undefined) {
      csvRows.push(
        `"Net Income Change","","${formatCurrency(report.data.netIncomeChange)}"`
      );
    }
    
    if (report.data.netIncomeChangePercentage !== undefined) {
      csvRows.push(
        `"Net Income Change %","","${formatPercentage(report.data.netIncomeChangePercentage)}"`
      );
    }
  }
  
  return csvRows;
}

function processCashFlowStatement(report: CashFlowStatementDto): string[] {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push('"Section","Description","Amount"');
  
  // Add operating activities
  csvRows.push('"OPERATING ACTIVITIES"');
  report.data.operatingActivities.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.items.forEach(item => {
      csvRows.push(`"","${item.description}","${formatCurrency(item.amount)}"`);
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"NET CASH FROM OPERATING ACTIVITIES","","${formatCurrency(report.data.netCashFromOperatingActivities)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add investing activities
  csvRows.push('"INVESTING ACTIVITIES"');
  report.data.investingActivities.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.items.forEach(item => {
      csvRows.push(`"","${item.description}","${formatCurrency(item.amount)}"`);
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"NET CASH FROM INVESTING ACTIVITIES","","${formatCurrency(report.data.netCashFromInvestingActivities)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add financing activities
  csvRows.push('"FINANCING ACTIVITIES"');
  report.data.financingActivities.forEach(section => {
    csvRows.push(`"${section.title}"`);
    
    section.items.forEach(item => {
      csvRows.push(`"","${item.description}","${formatCurrency(item.amount)}"`);
    });
    
    csvRows.push(`"Total ${section.title}","","${formatCurrency(section.total)}"`);
  });
  
  csvRows.push(`"NET CASH FROM FINANCING ACTIVITIES","","${formatCurrency(report.data.netCashFromFinancingActivities)}"`);
  csvRows.push(''); // Empty row for spacing
  
  // Add summary
  csvRows.push(`"NET CHANGE IN CASH","","${formatCurrency(report.data.netChangeInCash)}"`);
  csvRows.push(`"BEGINNING CASH BALANCE","","${formatCurrency(report.data.beginningCash)}"`);
  csvRows.push(`"ENDING CASH BALANCE","","${formatCurrency(report.data.endingCash)}"`);
  
  return csvRows;
}

/**
 * Format a number as a currency string
 */
function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number as a percentage string
 */
function formatPercentage(value: number | null | undefined): string {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2
  }).format(value / 100);
} 