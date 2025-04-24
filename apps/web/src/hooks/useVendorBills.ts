import { useState, useEffect, useCallback } from 'react';
import { Bill, BillStatus } from '@qbit/shared-types';
import { accountsPayableClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface UseVendorBillsProps {
  vendorId?: string | number;
  status?: BillStatus[];
  search?: string;
  autoFetch?: boolean;
}

export function useVendorBills({
  vendorId,
  status,
  search,
  autoFetch = true
}: UseVendorBillsProps = {}) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchBills = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (vendorId) {
        result = await accountsPayableClient.bills.getBillsByVendor(vendorId, {
          status: status ? status.join(',') : undefined,
          search
        });
      } else {
        result = await accountsPayableClient.bills.getAllBills({
          status: status ? status.join(',') : undefined,
          search
        });
      }
      setBills(result);
    } catch (err) {
      console.error('Error fetching vendor bills:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendor bills'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, vendorId, status, search]);

  useEffect(() => {
    if (autoFetch) {
      fetchBills();
    }
  }, [autoFetch, fetchBills]);

  return {
    bills,
    isLoading,
    error,
    refetch: fetchBills
  };
} 