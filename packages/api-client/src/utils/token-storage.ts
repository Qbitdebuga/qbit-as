const ACCESS_TOKEN_KEY = 'qbit_access_token';
const REFRESH_TOKEN_KEY = 'qbit_refresh_token';
const USER_KEY = 'qbit_user';

export const TokenStorage = {
  /**
   * Store authentication tokens and user data
   */
  setTokens(accessToken: string, refreshToken: string, user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Remove all authentication data
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Get the stored access token
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
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
    }
  },

  /**
   * Check if user is authenticated (has tokens)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}; 