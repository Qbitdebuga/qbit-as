const ACCESS_TOKEN_KEY = 'qbit_access_token';
const REFRESH_TOKEN_KEY = 'qbit_refresh_token';
const USER_KEY = 'qbit_user';
const CSRF_TOKEN_KEY = 'qbit_csrf_token';

// Helper to set cookies with expiration
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper to get cookie value
const getCookie = (name: string): string | null: any => {
  if (typeof document === 'undefined') return null;
  const match = document?.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? (match[3] || null) : null;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const TokenStorage = {
  /**
   * Store authentication tokens and user data
   */
  setTokens(accessToken: string, refreshToken: string, user: any): void {
    if (typeof window !== 'undefined') {
      // Store in localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Also store as cookies for NextJS middleware
      setCookie(ACCESS_TOKEN_KEY, accessToken);
      setCookie(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * Store only user data (for cookie-based auth)
   */
  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Store CSRF token
   */
  setCsrfToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CSRF_TOKEN_KEY, token);
    }
  },

  /**
   * Remove all authentication data
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(CSRF_TOKEN_KEY);
      
      // Clear cookies
      deleteCookie(ACCESS_TOKEN_KEY);
      deleteCookie(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Get the stored access token
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) return token;
      
      // Fall back to cookies
      return getCookie(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (token) return token;
      
      // Fall back to cookies
      return getCookie(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the stored CSRF token
   */
  getCsrfToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CSRF_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the stored user data
   */
  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Update just the access token
   */
  updateAccessToken(accessToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      setCookie(ACCESS_TOKEN_KEY, accessToken);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() || !!this.getUser();
  }
}; 