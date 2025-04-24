import { useState, useEffect, useCallback } from 'react';
import { Payment, PaymentMethod, PaymentStatus, CreatePaymentRequest } from '@qbit/shared-types';
import { useApiClient } from './useApiClient';

interface UsePaymentsOptions {
  invoiceId?: string;
  autoFetch?: boolean;
}

interface UsePaymentsResult {
  payments: Payment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createPayment: (payment: CreatePaymentRequest) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsResult {
  const { invoiceId, autoFetch = true } = options;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const apiClient = useApiClient();

  const fetchPayments = useCallback(async () => {
    if (!apiClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (invoiceId) {
        result = await apiClient.payments.getPaymentsByInvoiceId(invoiceId);
      } else {
        result = await apiClient.payments.getPayments();
      }
      
      setPayments(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payments'));
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, invoiceId]);

  const createPayment = useCallback(async (paymentData: CreatePaymentRequest): Promise<Payment | null> => {
    if (!apiClient) return null;
    
    try {
      const payment = await apiClient.payments.createPayment(paymentData);
      await fetchPayments(); // Refresh the payments list
      return payment;
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err : new Error('Failed to create payment'));
      return null;
    }
  }, [apiClient, fetchPayments]);

  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    if (!apiClient) return false;
    
    try {
      await apiClient.payments.deletePayment(id);
      await fetchPayments(); // Refresh the payments list
      return true;
    } catch (err) {
      console.error(`Error deleting payment ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to delete payment'));
      return false;
    }
  }, [apiClient, fetchPayments]);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [fetchPayments, autoFetch]);

  return {
    payments,
    isLoading,
    error,
    refetch: fetchPayments,
    createPayment,
    deletePayment
  };
} 