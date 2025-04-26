'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '@qbit/api-client';
import { authClient } from '@/utils/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse | void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<AuthResponse | void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      if (authClient.isAuthenticated()) {
        const userData = await authClient.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Clear any invalid tokens
      authClient.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<AuthResponse | void> => {
    setIsLoading(true);
    try {
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
    router.push('/login');
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse | void> => {
    setIsLoading(true);
    try {
      await authClient.register({ name, email, password });
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };
} 