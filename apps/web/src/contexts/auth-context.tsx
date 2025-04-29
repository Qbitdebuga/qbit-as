'use client';

import { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/utils/auth';
import { DEV_MODE } from '@qbit/auth-common';
import { User, AuthResponse, ApiError } from '@qbit/api-client/src/auth/types';
import { TokenStorage } from '@qbit/api-client/src/utils/token-storage';
import { navigateTo, ROUTES } from '@/utils/navigation';
import { handleError, ErrorDetails, AuthError } from '@/utils/error-handler';

// Track auth state globally to prevent multiple checks
let globalCheckInProgress = false;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse | null>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<AuthResponse | null>;
  checkAuthStatus: () => Promise<void>;
  error: ErrorDetails | null;
  clearError: () => void;
}

// Create context with safe undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check auth status function that can be called manually too
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (globalCheckInProgress) return;
    globalCheckInProgress = true;
    
    setIsLoading(true);
    try {
      // First try to get from TokenStorage for immediate display
      try {
        const storedUser = TokenStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (e) {
        console.warn('[Auth] Error reading user data:', e);
      }

      // Then try API if needed
      if (authClient.isAuthenticated()) {
        try {
          const userData = await authClient.getProfile();
          setUser(userData);
        } catch (err) {
          // Handle different error types
          const errorDetails = handleError(err, { 
            context: { operation: 'getProfile' } 
          });
          
          if (errorDetails.type === 'auth') {
            // Only clear tokens on auth errors if not in dev mode
            if (!DEV_MODE) {
              authClient.logout();
              setUser(null);
            }
          }
          
          setError(errorDetails);
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

  // Check auth once on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthResponse | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await authClient.login({ email, password, rememberMe });
      setUser(response.user);
      return response;
    } catch (err) {
      const errorDetails = handleError(err, { 
        context: { operation: 'login', email }
      });
      setError(errorDetails);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear local state first
    setUser(null);
    clearError();
    
    // Then call auth client logout
    authClient.logout();
    
    // In production mode, redirect to login
    if (!DEV_MODE) {
      // Use navigation utility instead of hard redirect
      navigateTo(ROUTES.LOGIN, { replace: true });
    } else {
      console.log('[Auth] Logout successful - DEV MODE: not redirecting');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      await authClient.register({ name, email, password });
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response;
    } catch (err) {
      const errorDetails = handleError(err, { 
        context: { operation: 'register', email, name }
      });
      setError(errorDetails);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    checkAuthStatus,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the auth hook with proper error handling
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new AuthError('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 