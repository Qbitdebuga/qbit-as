import { 
  AuthResponse, 
  LoginRequest, 
  RefreshTokenRequest, 
  TokenResponse, 
  User,
  UserRegistrationRequest,
  ApiError,
  TokenStorageType
} from './types';
import { TokenStorage } from '../utils/token-storage';
import { AUTH_ENDPOINTS } from '@qbit/auth-common';

export class AuthClient {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('AuthClient: Attempting login with credentials:', credentials.email);
    
    // Try endpoints from the centralized config
    const endpoints = [
      AUTH_ENDPOINTS.login,
      `${this.apiUrl}/api/v1/auth/login`, 
      `${this.apiUrl}/auth/login`
    ];
    let response = null;
    let lastError: ApiError | null = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: 'include', // Include cookies in the request
        });
        
        if (response.ok) break; // Found working endpoint
        
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          status: response.status,
          message: errorData.message || response.statusText || 'Login failed',
          code: errorData.code || response.status.toString(),
          type: 'auth', // categorize as auth error
          data: errorData
        };
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err);
        lastError = {
          status: 0,
          message: err instanceof Error ? err.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
          type: 'network',
          data: err
        };
      }
    }
    
    if (!response || !response.ok) {
      console.error('AuthClient: Login failed:', lastError);
      throw lastError || new Error('Login failed');
    }

    const data = await response.json();
    console.log('AuthClient: Login successful, received data:', {
      hasUser: !!data.user,
      hasTokens: !!data.accessToken,
      hasCsrfToken: !!data.csrfToken
    });
    
    // Store tokens using the refactored TokenStorage
    if (data.accessToken && data.refreshToken && data.user) {
      TokenStorage.setTokens(data.accessToken, data.refreshToken, data.user);
    }
    
    // Store CSRF token if provided
    if (data.csrfToken) {
      TokenStorage.setCsrfToken(data.csrfToken);
    }
    
    return data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Always clear client-side storage first
    TokenStorage.clearTokens();

    // Then try to call server-side logout
    try {
      // First check if the auth service is available
      try {
        const healthCheck = await fetch(`${this.apiUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Short timeout to fail fast if service is down
          signal: AbortSignal.timeout(2000)
        });
        
        if (healthCheck.ok) {
          // Only try server logout if health check passes
          // Try different endpoint formats for logout
          const endpoints = [
            AUTH_ENDPOINTS.logout,
            `${this.apiUrl}/api/v1/auth/logout`,
            `${this.apiUrl}/auth/logout`,
            `${this.apiUrl}/api/auth/logout`
          ];
          
          let success = false;
          
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
                },
              });
              
              if (response.ok) {
                success = true;
                break;
              }
            } catch (err) {
              // Silently continue to next endpoint
              console.log(`Endpoint ${endpoint} attempt failed, trying next option...`);
            }
          }
          
          if (!success) {
            // Log only in development, don't show to users
            console.log('Server-side logout didn\'t succeed, but client-side logout is complete');
          }
        } else {
          console.log('Auth service not available, client-side logout only');
        }
      } catch (error) {
        console.log('Auth service not available, client-side logout only');
      }
    } catch (error) {
      // Never throw any errors from logout
      console.log('Logout completed client-side only');
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<TokenResponse> {
    // Try endpoints from the centralized config
    const endpoints = [
      AUTH_ENDPOINTS.refresh,
      `${this.apiUrl}/api/v1/auth/refresh`,
      `${this.apiUrl}/auth/refresh`,
      `${this.apiUrl}/api/auth/refresh`
    ];
    
    let response = null;
    let lastError: ApiError | null = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
          },
        });
        
        if (response.ok) break;
        
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          status: response.status,
          message: errorData.message || response.statusText || 'Token refresh failed',
          code: errorData.code || response.status.toString(),
          type: 'auth',
          data: errorData
        };
      } catch (err) {
        console.warn(`Refresh endpoint ${endpoint} failed:`, err);
        lastError = {
          status: 0,
          message: err instanceof Error ? err.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
          type: 'network',
          data: err
        };
      }
    }

    if (!response || !response.ok) {
      // If refresh fails, log out the user
      await this.logout();
      throw lastError || {
        status: 401,
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED',
        type: 'auth'
      };
    }

    const data = await response.json();
    
    // Update the access token if returned
    if (data.accessToken) {
      TokenStorage.updateAccessToken(data.accessToken);
    }
    
    return data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    // Try endpoints from the centralized config
    const endpoints = [
      AUTH_ENDPOINTS.profile,
      `${this.apiUrl}/api/v1/auth/profile`,
      `${this.apiUrl}/auth/profile`,
      `${this.apiUrl}/api/auth/profile`
    ];
    
    let response = null;
    let lastError: ApiError | null = null;
    
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) {
      throw {
        status: 401,
        message: 'No access token available',
        code: 'NO_TOKEN',
        type: 'auth'
      };
    }
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
          },
          credentials: 'include',
        });
        
        if (response.ok) break;
        
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          status: response.status,
          message: errorData.message || response.statusText || 'Failed to fetch user profile',
          code: errorData.code || response.status.toString(),
          type: response.status === 401 ? 'auth' : (response.status === 403 ? 'permission' : 'server'),
          data: errorData
        };
      } catch (err) {
        console.warn(`Profile endpoint ${endpoint} failed:`, err);
        lastError = {
          status: 0,
          message: err instanceof Error ? err.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
          type: 'network',
          data: err
        };
      }
    }

    if (!response || !response.ok) {
      throw lastError || {
        status: 500,
        message: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_FAILED',
        type: 'server'
      };
    }

    const user = await response.json();
    
    // Update user in storage
    if (user) {
      TokenStorage.setUser(user);
    }
    
    return user;
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegistrationRequest): Promise<User> {
    // Try endpoints from the centralized config
    const endpoints = [
      AUTH_ENDPOINTS.register,
      `${this.apiUrl}/api/v1/auth/register`,
      `${this.apiUrl}/auth/register`
    ];
    
    let response = null;
    let lastError: ApiError | null = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (response.ok) break;
        
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          status: response.status,
          message: errorData.message || response.statusText || 'Registration failed',
          code: errorData.code || response.status.toString(),
          type: response.status === 400 ? 'validation' : 'server',
          data: errorData
        };
      } catch (err) {
        console.warn(`Register endpoint ${endpoint} failed:`, err);
        lastError = {
          status: 0,
          message: err instanceof Error ? err.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
          type: 'network',
          data: err
        };
      }
    }

    if (!response || !response.ok) {
      throw lastError || {
        status: 500,
        message: 'Registration failed',
        code: 'REGISTRATION_FAILED',
        type: 'server'
      };
    }

    return await response.json();
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenStorage.hasTokens();
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) {
      throw {
        status: 401,
        message: 'No access token available',
        code: 'NO_TOKEN',
        type: 'auth'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText || 'Failed to fetch users',
          code: errorData.code || response.status.toString(),
          type: response.status === 401 ? 'auth' : (response.status === 403 ? 'permission' : 'server'),
          data: errorData
        };
      }

      return await response.json();
    } catch (err) {
      if ((err as ApiError)?.type) {
        throw err;
      }

      throw {
        status: 0,
        message: err instanceof Error ? err.message : 'Failed to fetch users',
        code: 'NETWORK_ERROR',
        type: 'network',
        data: err
      };
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) {
      throw {
        status: 401,
        message: 'No access token available',
        code: 'NO_TOKEN',
        type: 'auth'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText || `Failed to fetch user with ID ${userId}`,
          code: errorData.code || response.status.toString(),
          type: response.status === 401 ? 'auth' : 
               (response.status === 403 ? 'permission' : 
               (response.status === 404 ? 'notFound' : 'server')),
          data: errorData
        };
      }

      return await response.json();
    } catch (err) {
      if ((err as ApiError)?.type) {
        throw err;
      }

      throw {
        status: 0,
        message: err instanceof Error ? err.message : `Failed to fetch user with ID ${userId}`,
        code: 'NETWORK_ERROR',
        type: 'network',
        data: err
      };
    }
  }
} 