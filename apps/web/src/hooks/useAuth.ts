'use client';

import { useAuth as useAuthContext } from '@/contexts/auth-context';
import { User, AuthResponse } from '@qbit/api-client/src/auth/types';
import { ErrorDetails } from '@/utils/error-handler';

/**
 * Hook for accessing authentication functionality throughout the application
 * 
 * @returns Authentication context with user data and auth methods
 */
export interface UseAuthResult {
  /**
   * Current authenticated user or null if not authenticated
   */
  user: User | null;
  
  /**
   * Whether authentication is currently being checked/loaded
   */
  isLoading: boolean;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Any authentication error that occurred
   */
  error: ErrorDetails | null;
  
  /**
   * Log in with email and password
   * @param email User email
   * @param password User password
   * @param rememberMe Whether to persist authentication
   * @returns Authentication response or null if login failed
   */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse | null>;
  
  /**
   * Log out the current user
   */
  logout: () => void;
  
  /**
   * Register a new user
   * @param name User name
   * @param email User email
   * @param password User password
   * @returns Authentication response or null if registration failed
   */
  register: (name: string, email: string, password: string) => Promise<AuthResponse | null>;
  
  /**
   * Manually check authentication status
   */
  checkAuthStatus: () => Promise<void>;
  
  /**
   * Clear any authentication errors
   */
  clearError: () => void;
  
  /**
   * Check if the current user has the required role(s)
   * @param requiredRoles Roles to check for
   * @returns Whether the user has at least one of the required roles
   */
  hasRole: (requiredRoles: string | string[]) => boolean;
}

/**
 * This hook provides access to authentication state and methods.
 * All authentication logic is centralized in the AuthContext.
 */
export function useAuth(): UseAuthResult {
  const authContext = useAuthContext();
  
  // Add a utility function for role checking
  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!authContext.user || !authContext.user.roles) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.some(role => authContext.user!.roles.includes(role));
  };
  
  return {
    ...authContext,
    hasRole
  };
} 