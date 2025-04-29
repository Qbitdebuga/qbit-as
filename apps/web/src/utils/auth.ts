'use client';

// Import the authClient directly from the configured module
import { AuthClient } from '@qbit/api-client/src/auth/auth-client';
import { AUTH_API_BASE_URL } from '@qbit/auth-common';

// Create a single instance of AuthClient to be used throughout the app
// This is primarily for the auth context to use internally
export const authClient = new AuthClient(AUTH_API_BASE_URL);

/**
 * @deprecated Use the useAuth() hook from auth-context.tsx instead
 * All auth-related functionality should be accessed through the useAuth() hook
 * from auth-context.tsx. Direct use of this module should be avoided.
 */

/**
 * Parse JWT token and return its payload
 */
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

/**
 * Check if user is authenticated
 * @deprecated Use the useAuth() hook from auth-context.tsx instead
 */
export function isAuthenticated(): boolean {
  return authClient.isAuthenticated();
}

/**
 * Get user data from storage
 * @deprecated Use the useAuth() hook from auth-context.tsx instead
 */
export function getUser() {
  return authClient.getProfile();
}

/**
 * Check if the current user has the specified role
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
}

/**
 * These methods are deprecated in favor of using the useAuth() hook
 * and the utility functions in auth-utils.ts
 */ 