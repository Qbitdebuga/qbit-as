/**
 * Utility functions to help with authentication across components
 *
 * Note: This file is deprecated in favor of auth-utils.ts.
 * Please use the newer utilities that support cookie-based authentication.
 */

import { authClient } from './auth';

/**
 * Gets the current authentication token, used for API requests
 * @deprecated Use cookie-based authentication instead
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('qbit_access_token');
  }
  return null;
};

/**
 * Checks if the user is currently authenticated
 * @deprecated Use the useAuth() hook from auth-context.tsx instead
 */
export const isUserAuthenticated = (): boolean => {
  return authClient.isAuthenticated();
};

/**
 * Auth helper utilities for setting up API clients
 */

interface ApiClient {
  setToken: (token: string) => void;
}

/**
 * Sets up authentication for an API client using the token from local storage
 * @param client The API client instance to set up
 */
export function setupAuthForClient(client: ApiClient): void {
  const token = localStorage.getItem('auth_token');
  if (token) {
    client.setToken(token);
  }
}
