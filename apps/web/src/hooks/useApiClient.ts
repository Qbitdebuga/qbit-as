"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  authClient, 
  customersClient, 
  invoicesClient, 
  paymentsClient
} from '@/utils/api-clients';
import { TokenStorage } from '@qbit/api-client/src/utils/token-storage';

// API client hook for making authenticated API requests
export function useApiClient() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Update auth tokens when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Nothing to do here - the TokenStorage in the API client
      // package will handle this automatically
    } else {
      // Clear tokens using the centralized TokenStorage utility
      TokenStorage.clearTokens();
    }
    setLoading(false);
  }, [isAuthenticated]);
  
  const executeWithAuth = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      // Directly return the promise instead of using try/catch
      return fn();
    },
    [isAuthenticated]
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