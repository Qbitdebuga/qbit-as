import { User } from '../auth/types';
import { TokenStorageType } from '../auth/types';
import { DEV_MODE, TOKEN_CONFIG } from '@qbit/auth-common';

export enum StorageKey {
  ACCESS_TOKEN = 'qbit_access_token',
  REFRESH_TOKEN = 'qbit_refresh_token',
  USER_DATA = 'qbit_user_data',
  CSRF_TOKEN = 'qbit_csrf_token'
}

/**
 * Cookie options for token storage
 */
interface CookieOptions {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Generic storage item
 */
type StorageItem = string | User | null;

/**
 * Debug auth state for development
 */
interface AuthDebugState {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUser: boolean;
  isAuthenticated: boolean;
  storageType: TokenStorageType;
  tokenExpiry?: string;
}

/**
 * Token storage utility for managing authentication tokens and user data
 */
export class TokenStorage {
  // Default to using both storage types for compatibility
  private static storageType: TokenStorageType = 'both';

  /**
   * Configure token storage settings
   */
  public static configure(options: { storageType?: TokenStorageType }) {
    if (options.storageType) {
      this.storageType = options.storageType;
    }
  }

  /**
   * Store authentication tokens and user data
   */
  public static setTokens(accessToken: string, refreshToken: string, user: User): void {
    this.setItem(StorageKey.ACCESS_TOKEN, accessToken);
    this.setItem(StorageKey.REFRESH_TOKEN, refreshToken);
    this.setItem(StorageKey.USER_DATA, JSON.stringify(user));
  }

  /**
   * Update just the access token (e.g., after token refresh)
   */
  public static updateAccessToken(accessToken: string): void {
    this.setItem(StorageKey.ACCESS_TOKEN, accessToken);
  }

  /**
   * Store user data
   */
  public static setUser(user: User): void {
    this.setItem(StorageKey.USER_DATA, JSON.stringify(user));
  }

  /**
   * Store CSRF token (for cookie-based authentication)
   */
  public static setCsrfToken(token: string): void {
    this.setItem(StorageKey.CSRF_TOKEN, token);
  }

  /**
   * Clear all authentication data
   */
  public static clearTokens(): void {
    this.removeItem(StorageKey.ACCESS_TOKEN);
    this.removeItem(StorageKey.REFRESH_TOKEN);
    this.removeItem(StorageKey.USER_DATA);
    this.removeItem(StorageKey.CSRF_TOKEN);
  }

  /**
   * Get the current access token
   */
  public static getAccessToken(): string | null {
    return this.getItem(StorageKey.ACCESS_TOKEN) as string | null;
  }

  /**
   * Get the current refresh token
   */
  public static getRefreshToken(): string | null {
    return this.getItem(StorageKey.REFRESH_TOKEN) as string | null;
  }

  /**
   * Get the current CSRF token
   */
  public static getCsrfToken(): string | null {
    return this.getItem(StorageKey.CSRF_TOKEN) as string | null;
  }

  /**
   * Get the current user data
   */
  public static getUser(): User | null {
    const userData = this.getItem(StorageKey.USER_DATA) as string | null;
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as User;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  /**
   * Check if authentication tokens exist
   */
  public static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  /**
   * Generic method to set an item in storage
   */
  private static setItem(key: StorageKey, value: string): void {
    // Use the actual key from TOKEN_CONFIG if available (for consistency)
    const configKey = this.getConfigKey(key);
    
    if (this.storageType === 'localStorage' || this.storageType === 'both') {
      try {
        localStorage.setItem(configKey, value);
      } catch (e) {
        console.warn(`Failed to set ${key} in localStorage:`, e);
      }
    }
    
    if (this.storageType === 'cookie' || this.storageType === 'both') {
      try {
        const options: CookieOptions = {
          path: '/',
          sameSite: 'strict',
          secure: !DEV_MODE
        };
        
        // For refresh token, set a longer expiry
        if (key === StorageKey.REFRESH_TOKEN) {
          const expiry = new Date();
          // Set expiry to 30 days for refresh token
          expiry.setDate(expiry.getDate() + 30);
          options.expires = expiry;
        } else if (key === StorageKey.ACCESS_TOKEN) {
          const expiry = new Date();
          // Set expiry to 1 hour for access token
          expiry.setHours(expiry.getHours() + 1);
          options.expires = expiry;
        }
        
        this.setCookie(configKey, value, options);
      } catch (e) {
        console.warn(`Failed to set ${key} in cookie:`, e);
      }
    }
  }

  /**
   * Generic method to get an item from storage
   */
  private static getItem(key: StorageKey): StorageItem {
    const configKey = this.getConfigKey(key);
    let value: string | null = null;
    
    if (this.storageType === 'localStorage' || this.storageType === 'both') {
      try {
        value = localStorage.getItem(configKey);
        if (value) return value;
      } catch (e) {
        console.warn(`Failed to get ${key} from localStorage:`, e);
      }
    }
    
    if (this.storageType === 'cookie' || this.storageType === 'both') {
      try {
        value = this.getCookie(configKey);
        if (value) return value;
      } catch (e) {
        console.warn(`Failed to get ${key} from cookie:`, e);
      }
    }
    
    return null;
  }

  /**
   * Generic method to remove an item from storage
   */
  private static removeItem(key: StorageKey): void {
    const configKey = this.getConfigKey(key);
    
    if (this.storageType === 'localStorage' || this.storageType === 'both') {
      try {
        localStorage.removeItem(configKey);
      } catch (e) {
        console.warn(`Failed to remove ${key} from localStorage:`, e);
      }
    }
    
    if (this.storageType === 'cookie' || this.storageType === 'both') {
      try {
        this.removeCookie(configKey);
      } catch (e) {
        console.warn(`Failed to remove ${key} from cookie:`, e);
      }
    }
  }

  /**
   * Get configuration key from TOKEN_CONFIG or fallback to StorageKey
   */
  private static getConfigKey(key: StorageKey): string {
    // Define TOKEN_CONFIG keys mapping - using string keys to avoid type errors
    const keyMapping: Record<StorageKey, string> = {
      [StorageKey.ACCESS_TOKEN]: 'accessTokenKey',
      [StorageKey.REFRESH_TOKEN]: 'refreshTokenKey',
      [StorageKey.USER_DATA]: 'userKey',
      [StorageKey.CSRF_TOKEN]: 'csrfTokenKey'
    };
    
    const configKey = keyMapping[key];
    // Safe access to TOKEN_CONFIG - first cast to unknown, then to compatible type
    const config = TOKEN_CONFIG as unknown as Record<string, string | number>;
    const configValue = config[configKey];
    
    // Return string value or fallback
    return typeof configValue === 'string' ? configValue : key.toString();
  }

  /**
   * Set a cookie
   */
  private static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieString += '; secure';
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  }

  /**
   * Get a cookie value
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name && cookieValue !== undefined) {
        return decodeURIComponent(cookieValue);
      }
    }
    
    return null;
  }

  /**
   * Remove a cookie
   */
  private static removeCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    // Set expiration to past date to remove cookie
    this.setCookie(name, '', {
      expires: new Date(0),
      path: '/'
    });
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(): boolean {
    return this.hasTokens() && !!this.getUser();
  }

  /**
   * Get debug information about the auth state
   * Only for development use
   */
  public static getDebugInfo(): AuthDebugState {
    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      hasUser: !!this.getUser(),
      isAuthenticated: this.isAuthenticated(),
      storageType: this.storageType,
      tokenExpiry: undefined, // Simplified for type safety
    };
  }

  /**
   * Get token expiry date if available
   * Note: Temporarily disabled due to type safety issues
   * @private
   */
  private static getTokenExpiry(): string | undefined {
    // This method has been simplified to avoid TypeScript errors
    // Token expiry parsing will be implemented in a future update
    return undefined;
  }
} 