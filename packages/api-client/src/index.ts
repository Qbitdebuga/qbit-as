// This file will export all API client modules
export * from './auth';
export * from './utils/token-storage';
export * from './accounts';
export * from './api-client';
export * from './journal-entries';
export * from './reports';

export * from './customers';
export * from './invoices';
export * from './payments';
export * from './vendors';
export * from './bills';
export * from './products';
export * from './inventory';

// Base clients
export * from './base-client';
export * from './service-client';

// Special exports from general-ledger
export { GeneralLedgerClient } from './general-ledger';
export { BatchClient } from './general-ledger';
export { AccountsClient as GLAccountsClient } from './general-ledger';
export { JournalEntriesClient as GLJournalEntriesClient } from './general-ledger';

// Generic API Client
import { ApiClient } from './api-client';
import { TokenStorage } from './utils/token-storage';
import { ApiClient as LibApiClient } from './lib/api-client';
import axios from 'axios';
import { BaseApiClient } from './base-client';
import { ServiceApiClient } from './service-client';

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

// Default Base URL (can adjust later)
const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Initialize API client instances
// Legacy clients
const apiClient = new ApiClient(DEFAULT_API_BASE_URL, TokenStorage);
const libApiClient = new LibApiClient(DEFAULT_API_BASE_URL);
const axiosInstance = axios.create({ baseURL: DEFAULT_API_BASE_URL });

// New base clients
export const baseApiClient = new BaseApiClient(DEFAULT_API_BASE_URL, TokenStorage);

// Service Clients (will gradually migrate all to use BaseApiClient)
export const authClient = new AuthClient(DEFAULT_API_BASE_URL);
export const accountsClient = new AccountsClient(DEFAULT_API_BASE_URL, TokenStorage);
export const journalEntriesClient = new JournalEntriesClient(apiClient);
export const reportsClient = new ReportsClient(apiClient);
export const customersClient = new CustomersClient(apiClient);
export const invoicesClient = new InvoicesClient(libApiClient);
export const paymentsClient = new PaymentsClient(apiClient);
export const vendorsClient = new VendorsClient(apiClient);
export const billsClient = new BillsClient(apiClient);
export const productsClient = new ProductsClient(axiosInstance);
export const inventoryClient = new InventoryClient(axiosInstance);

// Export utility for creating clients
export const createApiClient = (baseUrl: string, token?: string) => {
  const client = new BaseApiClient(baseUrl, TokenStorage);
  if (token) {
    client.setToken(token);
  }
  return client;
};

// Export utility for creating service clients
export const createServiceClient = (
  baseUrl: string, 
  serviceId: string, 
  serviceName: string,
  authUrl: string
) => {
  return new ServiceApiClient(baseUrl, serviceId, serviceName, authUrl, TokenStorage);
};

// Accounts Payable APIs
export const accountsPayableClient = {
  vendors: vendorsClient,
  bills: billsClient,
  payments: paymentsClient
};