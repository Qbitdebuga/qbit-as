'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authClient, customersClient, invoicesClient, paymentsClient } from '@/utils/api-clients';
import { isAuthenticated as checkAuth } from '@/utils/auth';

export function useApiClient() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Update auth tokens when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Nothing to do here - the TokenStorage in the API client
      // package will handle this automatically
    } else {
      // Clear localStorage as a fallback
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qbit_access_token');
        localStorage.removeItem('qbit_refresh_token');
      }
    }
    setLoading(false);
  }, [isAuthenticated]);

  const executeWithAuth = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        return await fn();
      } catch (error: any) {
        // Handle specific API errors here if needed
        throw error;
      }
    },
    [isAuthenticated],
  );

  return {
    invoices: invoicesClient,
    customers: customersClient,
    payments: paymentsClient,
    auth: authClient,
    loading,
    executeWithAuth,
  };
}
