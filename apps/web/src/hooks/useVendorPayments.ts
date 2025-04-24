import { useState, useEffect, useCallback } from 'react';
import { 
  Payment, 
  CreatePaymentDto, 
  UpdatePaymentDto,
  ApplyPaymentDto,
  PaymentStatus
} from '@qbit/shared-types';
import { accountsPayableClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface UseVendorPaymentsProps {
  billId?: string | number;
  vendorId?: string | number;
  autoFetch?: boolean;
}

export function useVendorPayments({ 
  billId, 
  vendorId, 
  autoFetch = true 
}: UseVendorPaymentsProps = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (billId) {
        result = await accountsPayableClient.payments.getPaymentsByBill(billId);
      } else if (vendorId) {
        result = await accountsPayableClient.payments.getPaymentsByVendor(vendorId);
      } else {
        result = await accountsPayableClient.payments.getAllPayments();
      }
      setPayments(result);
    } catch (err) {
      console.error('Error fetching vendor payments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendor payments'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, billId, vendorId]);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [autoFetch, fetchPayments]);

  const createPayment = async (paymentData: CreatePaymentDto): Promise<Payment | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      const newPayment = await accountsPayableClient.payments.createPayment(paymentData);
      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err : new Error('Failed to create payment'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (id: string | number, data: UpdatePaymentDto): Promise<Payment | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      const updatedPayment = await accountsPayableClient.payments.updatePayment(id, data);
      setPayments(prev => prev.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      ));
      return updatedPayment;
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err : new Error('Failed to update payment'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (id: string | number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);

    try {
      await accountsPayableClient.payments.deletePayment(id);
      setPayments(prev => prev.filter(payment => payment.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete payment'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const applyPayment = async (applicationData: ApplyPaymentDto): Promise<Payment | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await accountsPayableClient.payments.applyPayment(applicationData);
      // Update the payment in the list
      setPayments(prev => prev.map(payment => 
        payment.id === result.id ? result : payment
      ));
      return result;
    } catch (err) {
      console.error('Error applying payment:', err);
      setError(err instanceof Error ? err : new Error('Failed to apply payment'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payments,
    isLoading,
    error,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    applyPayment
  };
} 