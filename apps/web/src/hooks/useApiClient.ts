"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Create a simpler APIClient that doesn't depend on the package
class SimpleApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, data?: any, params?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, data, params);
  }

  async put<T>(path: string, data?: any, params?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, data, params);
  }

  async patch<T>(path: string, data?: any, params?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, data, params);
  }

  async delete<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, params);
  }

  private async request<T>(
    method: string, 
    path: string, 
    data?: any, 
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // For 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return response.json();
  }
}

export function useApiClient() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const client = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return new SimpleApiClient(baseUrl);
  }, []);
  
  // Update the token whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      // Get token from localStorage since it's not exposed in useAuth
      const token = localStorage.getItem('qbit_access_token');
      if (token) {
        client.setToken(token);
      }
    } else {
      client.clearToken();
      // Also clear the localStorage as a fallback
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qbit_access_token');
        localStorage.removeItem('qbit_refresh_token');
      }
    }
    setLoading(false);
  }, [client, isAuthenticated]);
  
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