import { NextResponse } from 'next/server';

// Sample balance sheet data
const mockBalanceSheet = {
  reportDate: new Date().toISOString(),
  startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
  endDate: new Date().toISOString(),
  assets: {
    current: [
      { accountId: '1001', accountCode: '1001', accountName: 'Cash', amount: 125000 },
      { accountId: '1002', accountCode: '1002', accountName: 'Accounts Receivable', amount: 75000 },
      { accountId: '1003', accountCode: '1003', accountName: 'Inventory', amount: 50000 }
    ],
    nonCurrent: [
      { accountId: '1500', accountCode: '1500', accountName: 'Property & Equipment', amount: 200000 },
      { accountId: '1600', accountCode: '1600', accountName: 'Accumulated Depreciation', amount: -50000 }
    ],
    totalCurrent: 250000,
    totalNonCurrent: 150000,
    total: 400000
  },
  liabilities: {
    current: [
      { accountId: '2001', accountCode: '2001', accountName: 'Accounts Payable', amount: 45000 },
      { accountId: '2002', accountCode: '2002', accountName: 'Accrued Expenses', amount: 15000 }
    ],
    nonCurrent: [
      { accountId: '2500', accountCode: '2500', accountName: 'Long-term Loans', amount: 120000 }
    ],
    totalCurrent: 60000,
    totalNonCurrent: 120000,
    total: 180000
  },
  equity: {
    items: [
      { accountId: '3001', accountCode: '3001', accountName: 'Common Stock', amount: 100000 },
      { accountId: '3002', accountCode: '3002', accountName: 'Retained Earnings', amount: 120000 }
    ],
    total: 220000
  },
  liabilitiesAndEquity: {
    total: 400000
  }
};

export async function GET(request: Request) {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockBalanceSheet);
}

export async function POST(request: Request) {
  // Get request data but don't use it for the mock
  const data = await request.json();
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockBalanceSheet);
} 