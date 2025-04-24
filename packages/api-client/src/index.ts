// This file will export all API client modules
export * from './auth';
export * from './utils/token-storage';
export * from './accounts';
export * from './api-client';
export * from './journal-entries';
export * from './reports';
export * from './general-ledger';
export * from './customers';
export * from './invoices';
export * from './vendors';
export * from './bills';
export * from './products';
export * from './inventory';

// Generic API Client
import { ApiClient } from './lib/api-client';

// Clients
import { AuthClient } from './auth/auth-client';
import { AccountsClient } from './accounts/accounts-client';
import { JournalEntriesClient } from './journal-entries/journal-entries-client';
import { ReportsClient } from './reports/reports-client';
import { CustomersClient } from './customers/customers-client';
import { InvoicesClient } from './invoices/invoices-client';
import { PaymentsClient } from './payments/payments-client';
import { VendorsClient } from './vendors/vendors-client';
import { BillsClient } from './bills/bills-client';
import { ProductsClient } from './products/products-client';
import { InventoryClient } from './inventory/inventory-client';

// Account types
export * from './auth/types';

// Initialize API client
export const apiClient = new ApiClient();

// Initialize and expose service clients
export const authClient = new AuthClient(apiClient);
export const accountsClient = new AccountsClient(apiClient);
export const journalEntriesClient = new JournalEntriesClient(apiClient);
export const reportsClient = new ReportsClient(apiClient);
export const customersClient = new CustomersClient(apiClient);
export const invoicesClient = new InvoicesClient(apiClient);
export const paymentsClient = new PaymentsClient(apiClient);
export const vendorsClient = new VendorsClient(apiClient);
export const billsClient = new BillsClient(apiClient);
export const productsClient = new ProductsClient(apiClient);
export const inventoryClient = new InventoryClient(apiClient);

// Export utility for lib initialization
export const createApiClient = (baseUrl: string, token?: string) => {
  const client = new ApiClient(baseUrl);
  if (token) {
    client.setToken(token);
  }
  return client;
};

// Initialize Accounts Payable API client
export const accountsPayableClient = {
  vendors: new VendorsClient(apiClient, '/api/accounts-payable'),
  bills: new BillsClient(apiClient, '/api/accounts-payable'),
  payments: new PaymentsClient(apiClient, '/api/accounts-payable')
}; 