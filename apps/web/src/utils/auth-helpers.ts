/**
 * Utility functions to help with authentication across components
 * 
 * Note: This file is deprecated in favor of auth-utils.ts.
 * Please use the newer utilities that support cookie-based authentication.
 */

import { authClient } from './auth';
import { TokenStorage } from '@qbit/api-client/src/utils/token-storage';

/**
 * Gets the current authentication token, used for API requests
 * @deprecated Use cookie-based authentication instead
 */
export const getAuthToken = (): string | null => {
  return TokenStorage.getAccessToken();
};

/**
 * Checks if the user is currently authenticated
 * @deprecated Use the useAuth() hook from auth-context.tsx instead
 */
export const isUserAuthenticated = (): boolean => {
  return authClient.isAuthenticated();
};

/**
 * Setup authentication for clients that need a token
 * @param client Any API client with a setAuthToken method
 * @deprecated No longer needed with cookie-based authentication
 */
export const setupAuthForClient = (client: { setAuthToken: (token: string) => void }): boolean => {
  const token = getAuthToken();
  if (token && client.setAuthToken) {
    client.setAuthToken(token);
    return true;
  }
  return false;
}; 