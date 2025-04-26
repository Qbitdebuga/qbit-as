// API client utilities for the frontend application
import { PaymentStatus } from '@qbit-accounting/shared-types';

// Base URL from environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to get the authorization header
export const getAuthHeader = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch with authentication
export const apiFetch = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
    ...getAuthHeader()
  });

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// Accounts Payable Client for Vendor Payments
export const accountsPayableClient = {
  getVendorPayments: async (vendorId: string) => {
    return apiFetch<any[]>(`/accounts-payable/vendors/${vendorId}/payments`);
  },
  
  getPaymentById: async (paymentId: string) => {
    return apiFetch<any>(`/accounts-payable/payments/${paymentId}`);
  },
  
  createPayment: async (paymentData: any) => {
    return apiFetch<any>('/accounts-payable/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  updatePaymentStatus: async (paymentId: string, status: PaymentStatus) => {
    return apiFetch<any>(`/accounts-payable/payments/${paymentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  
  deletePayment: async (paymentId: string) => {
    return apiFetch(`/accounts-payable/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },
  
  applyPaymentToBill: async (paymentId: string, billId: string, amount: number) => {
    return apiFetch<any>(`/accounts-payable/payments/${paymentId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ billId, amount }),
    });
  }
}; 