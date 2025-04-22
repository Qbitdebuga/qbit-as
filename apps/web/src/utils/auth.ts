'use client';

import { TokenStorage } from 'api-client';

/**
 * Check if user is authenticated by examining tokens
 */
export function isAuthenticated(): boolean {
  return TokenStorage.isAuthenticated();
}

/**
 * Get user data from storage
 */
export function getUser() {
  return TokenStorage.getUser();
}

/**
 * Check if the current user has the specified role
 */
export function hasRole(role: string): boolean {
  const user = getUser();
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if the current user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const user = getUser();
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role));
}

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