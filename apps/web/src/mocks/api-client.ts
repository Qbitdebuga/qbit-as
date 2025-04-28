/**
 * Mock API clients for the web app
 * These are temporary mocks to allow the build to complete successfully
 */

import {
  StatementPeriod,
  BalanceSheetStatementDto,
  IncomeStatementDto,
  CashFlowStatementDto,
  Bill,
  BillCreate,
  BillUpdate,
  BillStatus,
} from './shared-types';

// Common base client
class BaseApiClient {
  constructor(protected readonly baseUrl: string = 'http://localhost:3000/api') {}

  protected async get<T>(path: string): Promise<T> {
    console.log(`Mock GET request to ${path}`);
    return {} as T;
  }

  protected async post<T>(path: string, data: any): Promise<T> {
    console.log(`Mock POST request to ${path} with data:`, data);
    return {} as T;
  }

  protected async put<T>(path: string, data: any): Promise<T> {
    console.log(`Mock PUT request to ${path} with data:`, data);
    return {} as T;
  }

  protected async delete(path: string): Promise<void> {
    console.log(`Mock DELETE request to ${path}`);
  }
}

// Bills client
export class BillsClient extends BaseApiClient {
  constructor() {
    super('/bills');
  }

  async getAllBills(): Promise<Bill[]> {
    return [
      {
        id: '1',
        billNumber: 'BILL-001',
        status: BillStatus.APPROVED,
        vendor: {
          id: 'vendor-1',
          name: 'Acme Corp',
        },
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 100,
        totalAmount: 110,
        amountPaid: 0,
        balanceDue: 110,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        billNumber: 'BILL-002',
        status: BillStatus.PENDING,
        vendor: {
          id: 'vendor-2',
          name: 'Globex',
        },
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 200,
        totalAmount: 220,
        amountPaid: 0,
        balanceDue: 220,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getBillById(id: string): Promise<Bill> {
    return {
      id,
      billNumber: `BILL-${id.padStart(3, '0')}`,
      status: BillStatus.APPROVED,
      vendor: {
        id: 'vendor-1',
        name: 'Acme Corp',
      },
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: 100,
      totalAmount: 110,
      amountPaid: 0,
      balanceDue: 110,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async createBill(billData: BillCreate): Promise<Bill> {
    return {
      id: Math.random().toString(36).substring(2, 9),
      billNumber: `BILL-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      status: BillStatus.DRAFT,
      vendor: {
        id: billData.vendorId,
        name: 'Vendor Name',
      },
      date: billData.date,
      dueDate: billData.dueDate,
      subtotal: 0,
      totalAmount: 0,
      amountPaid: 0,
      balanceDue: 0,
      notes: billData.notes,
      terms: billData.terms,
      reference: billData.reference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateBill(id: string, billData: BillUpdate): Promise<Bill> {
    return {
      id,
      billNumber: `BILL-${id.padStart(3, '0')}`,
      status: BillStatus.PENDING,
      vendor: {
        id: billData.vendorId || 'vendor-id',
        name: 'Updated Vendor',
      },
      date: billData.date || new Date().toISOString(),
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: 150,
      totalAmount: 165,
      amountPaid: 0,
      balanceDue: 165,
      notes: billData.notes,
      terms: billData.terms,
      reference: billData.reference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async approveBill(id: string): Promise<Bill> {
    return {
      id,
      billNumber: `BILL-${id.padStart(3, '0')}`,
      status: BillStatus.APPROVED,
      vendor: {
        id: 'vendor-id',
        name: 'Acme Corp',
      },
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: 100,
      totalAmount: 110,
      amountPaid: 0,
      balanceDue: 110,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelBill(id: string): Promise<Bill> {
    return {
      id,
      billNumber: `BILL-${id.padStart(3, '0')}`,
      status: BillStatus.CANCELLED,
      vendor: {
        id: 'vendor-id',
        name: 'Acme Corp',
      },
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: 100,
      totalAmount: 110,
      amountPaid: 0,
      balanceDue: 110,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

// Reports client for financial statements
export class ReportsClient extends BaseApiClient {
  constructor(client: any) {
    super('/reports');
  }

  async generateBalanceSheet(params: {
    startDate?: string;
    endDate?: string;
    period: StatementPeriod;
    comparativePeriod?: boolean;
    includeZeroBalances?: boolean;
  }): Promise<BalanceSheetStatementDto> {
    return {
      asOfDate: params.endDate || new Date().toISOString(),
      assets: {
        total: 100000,
        categories: [
          {
            name: 'Current Assets',
            total: 75000,
            accounts: [
              { code: '1000', name: 'Cash', balance: 50000 },
              { code: '1100', name: 'Accounts Receivable', balance: 25000 },
            ],
          },
          {
            name: 'Fixed Assets',
            total: 25000,
            accounts: [
              { code: '1500', name: 'Equipment', balance: 30000 },
              { code: '1600', name: 'Accumulated Depreciation', balance: -5000 },
            ],
          },
        ],
      },
      liabilities: {
        total: 40000,
        categories: [
          {
            name: 'Current Liabilities',
            total: 30000,
            accounts: [
              { code: '2000', name: 'Accounts Payable', balance: 20000 },
              { code: '2100', name: 'Accrued Expenses', balance: 10000 },
            ],
          },
          {
            name: 'Long Term Liabilities',
            total: 10000,
            accounts: [{ code: '2500', name: 'Bank Loan', balance: 10000 }],
          },
        ],
      },
      equity: {
        total: 60000,
        categories: [
          {
            name: 'Equity',
            total: 60000,
            accounts: [
              { code: '3000', name: 'Common Stock', balance: 30000 },
              { code: '3900', name: 'Retained Earnings', balance: 30000 },
            ],
          },
        ],
      },
    };
  }

  async generateIncomeStatement(params: {
    startDate: string;
    endDate: string;
    period: StatementPeriod;
    comparativePeriod?: boolean;
    includeZeroBalances?: boolean;
  }): Promise<IncomeStatementDto> {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      revenue: {
        total: 50000,
        categories: [
          {
            name: 'Operating Revenue',
            total: 50000,
            accounts: [{ code: '4000', name: 'Sales Revenue', amount: 50000 }],
          },
        ],
      },
      expenses: {
        total: 30000,
        categories: [
          {
            name: 'Operating Expenses',
            total: 25000,
            accounts: [
              { code: '5000', name: 'Cost of Goods Sold', amount: 15000 },
              { code: '5100', name: 'Salaries', amount: 10000 },
            ],
          },
          {
            name: 'Other Expenses',
            total: 5000,
            accounts: [
              { code: '5500', name: 'Rent', amount: 3000 },
              { code: '5600', name: 'Utilities', amount: 2000 },
            ],
          },
        ],
      },
      netIncome: 20000,
    };
  }

  async generateCashFlowStatement(params: {
    startDate: string;
    endDate: string;
    period: StatementPeriod;
    comparativePeriod?: boolean;
    includeZeroBalances?: boolean;
  }): Promise<CashFlowStatementDto> {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      operatingActivities: {
        total: 15000,
        items: [
          { description: 'Net Income', amount: 20000 },
          { description: 'Depreciation', amount: 5000 },
          { description: 'Increase in Accounts Receivable', amount: -10000 },
        ],
      },
      investingActivities: {
        total: -5000,
        items: [{ description: 'Purchase of Equipment', amount: -5000 }],
      },
      financingActivities: {
        total: -2000,
        items: [{ description: 'Loan Repayment', amount: -2000 }],
      },
      netCashFlow: 8000,
      beginningCashBalance: 42000,
      endingCashBalance: 50000,
    };
  }
}

// Vendors client
export class VendorsClient extends BaseApiClient {
  constructor(client: any) {
    super('/vendors');
  }

  async getVendors(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '555-123-4567',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Globex',
        email: 'info@globex.com',
        phone: '555-987-6543',
        address: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getVendorById(id: string): Promise<any> {
    return {
      id,
      name: id === '1' ? 'Acme Corp' : 'Globex',
      email: id === '1' ? 'contact@acme.com' : 'info@globex.com',
      phone: id === '1' ? '555-123-4567' : '555-987-6543',
      address: id === '1' ? '123 Main St' : '456 Market St',
      city: id === '1' ? 'New York' : 'San Francisco',
      state: id === '1' ? 'NY' : 'CA',
      zipCode: id === '1' ? '10001' : '94105',
      country: 'USA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async createVendor(data: any): Promise<any> {
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateVendor(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteVendor(id: string): Promise<void> {
    console.log(`Deleting vendor with ID: ${id}`);
  }
}

// Create instances of clients
export const billsClient = new BillsClient();
