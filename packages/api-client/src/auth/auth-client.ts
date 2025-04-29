import { 
  AuthResponse, 
  LoginRequest, 
  RefreshTokenRequest, 
  TokenResponse, 
  User,
  UserRegistrationRequest
} from './types';
import { TokenStorage } from '../utils/token-storage';

// Helper function to set a cookie manually
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  // Use Lax SameSite to allow redirects with cookies
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

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
    
    // Try both endpoint formats
    const endpoints = [`${this.apiUrl}/api/v1/auth/login`, `${this.apiUrl}/auth/login`];
    let response = null;
    let lastError = null;
    
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
        lastError = await response.json().catch(() => ({}));
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err);
        lastError = err;
      }
    }
    
    if (!response || !response.ok) {
      console.error('AuthClient: Login failed:', lastError);
      throw new Error(lastError?.message || 'Login failed');
    }

    const data = await response.json();
    console.log('AuthClient: Login successful, received data:', {
      hasUser: !!data.user,
      hasTokens: !!data.accessToken,
      hasCsrfToken: !!data.csrfToken
    });
    
    // Always store tokens in both localStorage and cookies for redundancy
    if (data.accessToken) {
      localStorage.setItem('qbit_access_token', data.accessToken);
      
      // Set as cookie too
      const expires = new Date(Date.now() + 7 * 86400000).toUTCString();
      document.cookie = `qbit_access_token=${data.accessToken}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    // Always store user data
    if (data.user) {
      localStorage.setItem('qbit_user', JSON.stringify(data.user));
    }
    
    // Store CSRF token if provided
    if (data.csrfToken) {
      localStorage.setItem('qbit_csrf_token', data.csrfToken);
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
    // Try both endpoint formats
    const endpoints = [
      `${this.apiUrl}/api/v1/auth/refresh`,
      `${this.apiUrl}/auth/refresh`,
      `${this.apiUrl}/api/auth/refresh`
    ];
    
    let response = null;
    let lastError = null;
    
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
        lastError = await response.json().catch(() => ({}));
      } catch (err) {
        console.warn(`Refresh endpoint ${endpoint} failed:`, err);
        lastError = err;
      }
    }

    if (!response || !response.ok) {
      // If refresh fails, log out the user
      await this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    // Try to get from storage first
    const user = TokenStorage.getUser();
    if (user) return user;
    
    // Try different endpoint formats
    const endpoints = [
      `${this.apiUrl}/api/v1/auth/profile`,
      `${this.apiUrl}/auth/profile`,
      `${this.apiUrl}/api/auth/profile`,
      `${this.apiUrl}/api/v1/users/me`,
      `${this.apiUrl}/users/me`
    ];
    
    let response = null;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) break;
        
        if (response.status === 401) {
          // Will handle 401 after the loop
          lastError = { status: 401 };
          continue;
        }
        
        lastError = await response.json().catch(() => ({}));
      } catch (err) {
        console.warn(`Profile endpoint ${endpoint} failed:`, err);
        lastError = err;
      }
    }

    if (!response || !response.ok) {
      if (lastError?.status === 401) {
        // Try to refresh the token
        try {
          await this.refreshToken();
          // Retry with the new token
          return this.getProfile();
        } catch (error) {
          await this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw new Error('Failed to get user profile');
    }

    const userData = await response.json();
    // Store the user data
    TokenStorage.setUser(userData);
    
    return userData;
  }

  /**
   * Register new user
   */
  async register(userData: UserRegistrationRequest): Promise<User> {
    const response = await fetch(`${this.apiUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // For cookie-based auth, we check if the user data exists
    // The actual token validation happens on the server with the cookies
    return !!TokenStorage.getUser();
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.apiUrl}/api/v1/users`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        try {
          await this.refreshToken();
          // Retry with the new token
          return this.getUsers();
        } catch (error) {
          await this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw new Error('Failed to get users list');
    }

    return response.json();
  }

  /**
   * Get a specific user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}/api/v1/users/${userId}`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      if (response.status === 401) {
        try {
          await this.refreshToken();
          return this.getUserById(userId);
        } catch (error) {
          await this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw new Error('Failed to get user');
    }

    return response.json();
  }
} 