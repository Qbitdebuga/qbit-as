import { useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceListParams, InvoiceStatus } from '@qbit/shared-types';
import { useApiClient } from './useApiClient';

interface UseInvoicesOptions extends Partial<InvoiceListParams> {
  customerId?: string;
  autoFetch?: boolean;
}

interface UseInvoicesResult {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => Promise<void>;
  fetchById: (id: string) => Promise<Invoice | null>;
}

export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesResult {
  const { autoFetch = true, customerId, ...params } = options;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const apiClient = useApiClient();

  const fetchInvoices = useCallback(async () => {
    if (!apiClient) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (customerId) {
        result = await apiClient.invoices.getInvoicesByCustomer(customerId, params);
      } else {
        result = await apiClient.invoices.getInvoices(params);
      }

      setInvoices(result.data);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, customerId, params]);

  const fetchById = useCallback(
    async (id: string): Promise<Invoice | null> => {
      if (!apiClient) return null;

      try {
        return await apiClient.invoices.getInvoiceById(id);
      } catch (err) {
        console.error(`Error fetching invoice ${id}:`, err);
        return null;
      }
    },
    [apiClient],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchInvoices();
    }
  }, [fetchInvoices, autoFetch]);

  return {
    invoices,
    isLoading,
    error,
    total,
    page,
    limit,
    refetch: fetchInvoices,
    fetchById,
  };
}
