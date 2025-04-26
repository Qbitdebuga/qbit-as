/**
 * Utility functions to help with authentication across components
 */

import { authClient } from './auth';

/**
 * Gets the current authentication token, used for API requests
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('qbit_access_token');
  }
  return null;
};

/**
 * Checks if the user is currently authenticated
 */
export const isUserAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Setup authentication for clients that need a token
 * @param client Any API client with a setAuthToken method
 */
export const setupAuthForClient = (client: { setAuthToken: (token: string) => void }): boolean => {
  const token = getAuthToken();
  if (token && client.setAuthToken) {
    client.setAuthToken(token);
    return true;
  }
  return false;
}; 