// Mock implementations of API clients for the web app
// TODO: Replace with actual API client imports when package is properly transpiled

// Define basic client interfaces
interface ApiClient {
  baseUrl: string;
}

interface InvoiceClient extends ApiClient {
  getInvoices: () => Promise<any[]>;
  getInvoiceById: (id: string) => Promise<any>;
  createInvoice: (data: any) => Promise<any>;
  updateInvoice: (id: string, data: any) => Promise<any>;
  deleteInvoice: (id: string) => Promise<void>;
}

interface CustomerClient extends ApiClient {
  getCustomers: () => Promise<any[]>;
  getCustomerById: (id: string) => Promise<any>;
  createCustomer: (data: any) => Promise<any>;
  updateCustomer: (id: string, data: any) => Promise<any>;
  deleteCustomer: (id: string) => Promise<void>;
}

interface PaymentClient extends ApiClient {
  getPayments: () => Promise<any[]>;
  getPaymentById: (id: string) => Promise<any>;
  createPayment: (data: any) => Promise<any>;
  updatePayment: (id: string, data: any) => Promise<any>;
  deletePayment: (id: string) => Promise<void>;
}

interface AuthClientType extends ApiClient {
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

// Create mock implementations
const mockClient = (name: string): ApiClient => ({
  baseUrl: `http://localhost:3000/api/${name}`,
});

export const authClient: AuthClientType = {
  ...mockClient('auth'),
  login: async () => ({
    token: 'mock-token',
    user: { id: '1', name: 'Mock User', email: 'user@example.com' },
  }),
  register: async () => ({ message: 'Success' }),
  forgotPassword: async () => ({ message: 'Success' }),
  resetPassword: async () => ({ message: 'Success' }),
  logout: async () => {},
};

export const invoicesClient: InvoiceClient = {
  ...mockClient('invoices'),
  getInvoices: async () => [],
  getInvoiceById: async () => ({}),
  createInvoice: async () => ({}),
  updateInvoice: async () => ({}),
  deleteInvoice: async () => {},
};

export const customersClient: CustomerClient = {
  ...mockClient('customers'),
  getCustomers: async () => [],
  getCustomerById: async () => ({}),
  createCustomer: async () => ({}),
  updateCustomer: async () => ({}),
  deleteCustomer: async () => {},
};

export const paymentsClient: PaymentClient = {
  ...mockClient('payments'),
  getPayments: async () => [],
  getPaymentById: async () => ({}),
  createPayment: async () => ({}),
  updatePayment: async () => ({}),
  deletePayment: async () => {},
};
