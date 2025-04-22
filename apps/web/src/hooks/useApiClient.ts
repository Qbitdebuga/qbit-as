"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from '@qbit/api-client';
import { useAuth } from '@/contexts/auth-context';

export function useApiClient() {
  const { accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const client = useMemo(() => {
    // Create a base API client instance
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return new ApiClient(baseUrl);
  }, []);
  
  // Update the token whenever it changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      client.setAuthToken(accessToken);
    } else {
      client.clearAuthToken();
    }
    setLoading(false);
  }, [client, accessToken, isAuthenticated]);
  
  const executeWithAuth = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
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
    [isAuthenticated]
  );
  
  return {
    client,
    loading,
    executeWithAuth,
  };
} 