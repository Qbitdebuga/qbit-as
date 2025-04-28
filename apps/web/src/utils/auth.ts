'use client';

// Mock implementation for the web app
// TODO: Replace with actual API client imports when package is properly transpiled

// Mock classes to replace the imports
export class TokenStorage {
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  static getProfile(): any | null {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    }
    return null;
  }

  static setProfile(profile: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(profile));
    }
  }

  static removeProfile(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_profile');
    }
  }
}

export class AuthClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  isAuthenticated(): boolean {
    return !!TokenStorage.getToken();
  }

  getProfile(): any {
    return TokenStorage.getProfile();
  }

  async login(email: string, password: string): Promise<any> {
    // Mock implementation
    const mockResponse = {
      token: 'mock-token',
      user: {
        id: '1',
        name: 'Mock User',
        email,
        roles: ['user'],
      },
    };

    TokenStorage.setToken(mockResponse.token);
    TokenStorage.setProfile(mockResponse.user);

    return mockResponse;
  }

  async logout(): Promise<void> {
    TokenStorage.removeToken();
    TokenStorage.removeProfile();
  }
}

// Create a single instance of AuthClient to be used throughout the app
export const authClient = new AuthClient(
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002',
);

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
  return roles.some((role) => user.roles.includes(role));
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
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
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
 * These methods are deprecated in favor of using the useAuth() hook
 * and the utility functions in auth-utils.ts
 */
