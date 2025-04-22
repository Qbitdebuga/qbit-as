'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';

// Define types for service health
export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  name: string;
  url: string;
  details: {
    checks: HealthCheck[];
    error?: string;
    version?: string;
    uptime?: number;
  };
  lastChecked: string;
}

export interface HealthCheck {
  name: string;
  status: 'up' | 'down' | 'degraded';
  details?: Record<string, any>;
}

export interface SystemStatusData {
  services: ServiceHealth[];
  overall: 'up' | 'down' | 'degraded';
  lastUpdated: string;
}

export function useSystemStatus() {
  const { client, loading: clientLoading, executeWithAuth } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SystemStatusData | null>(null);

  /**
   * Fetch the health status of all services
   */
  const getServicesHealth = useCallback(async (): Promise<SystemStatusData | null> => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        const response = await client.get('/admin/system-status');
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  /**
   * Check a specific service's health directly
   */
  const checkServiceHealth = useCallback(async (serviceId: string): Promise<ServiceHealth | null> => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      return await executeWithAuth(async () => {
        const response = await client.get(`/admin/service-health/${serviceId}`);
        return response;
      });
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  /**
   * Refresh all service health data
   */
  const refreshSystemStatus = useCallback(async (): Promise<SystemStatusData | null> => {
    if (clientLoading) return null;

    try {
      setLoading(true);
      setError(null);

      const result = await executeWithAuth(async () => {
        const response = await client.post('/admin/refresh-system-status', {});
        return response;
      });

      if (result) {
        setData(result);
      }

      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client, clientLoading, executeWithAuth]);

  // Auto-fetch the system status on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const result = await getServicesHealth();
      if (result) {
        setData(result);
      }
    };

    if (!clientLoading) {
      fetchInitialData();
    }
  }, [clientLoading, getServicesHealth]);

  return {
    loading: loading || clientLoading,
    error,
    data,
    getServicesHealth,
    checkServiceHealth,
    refreshSystemStatus,
  };
} 