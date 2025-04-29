'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/utils/auth';

// Import types from the correct location
import { User, AuthResponse } from '@qbit/api-client/src/auth/types';

// Development mode flag - must match middleware
const DEV_MODE = true;

// Track auth state globally to prevent multiple checks
let globalCheckInProgress = false;

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse | null>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<AuthResponse | null>;
  checkAuthManually: () => Promise<void>; // Added for manual checks
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start with false to prevent loading flash

  // Check auth helper that can be called manually
  const checkAuthManually = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (globalCheckInProgress) return;
    globalCheckInProgress = true;
    
    setIsLoading(true);
    try {
      // First try to get from localStorage for immediate display
      try {
        const storedUser = localStorage.getItem('qbit_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (e) {
        console.warn('[Auth] Error reading from localStorage:', e);
      }

      // Then try API if needed
      if (authClient.isAuthenticated()) {
        try {
          const userData = await authClient.getProfile();
          setUser(userData);
        } catch (error) {
          console.warn('[Auth] Failed to get user profile:', error);
          // Only clear tokens on API error if we're in production
          if (!DEV_MODE) {
            authClient.logout();
            setUser(null);
          }
        }
      } else {
        // Not authenticated according to authClient
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      globalCheckInProgress = false;
    }
  }, []);

  // Check auth only once on mount
  useEffect(() => {
    checkAuthManually();
  }, [checkAuthManually]);

  const login = async (email: string, password: string): Promise<AuthResponse | null> => {
    setIsLoading(true);
    try {
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response;
    } catch (error) {
      console.warn('[Auth] Login failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear local state first
    setUser(null);
    
    // Then call auth client logout
    authClient.logout();
    
    // In production mode, redirect to login
    if (!DEV_MODE) {
      // Hard redirect to avoid any React state issues
      window.location.href = '/login';
    } else {
      console.log('[Auth] Logout successful - DEV MODE: not redirecting');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse | null> => {
    setIsLoading(true);
    try {
      await authClient.register({ name, email, password });
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response;
    } catch (error) {
      console.warn('[Auth] Registration failed:', error);
      return null;
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
    checkAuthManually
  };
} 