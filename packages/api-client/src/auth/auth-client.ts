import { 
  AuthResponse, 
  LoginRequest, 
  RefreshTokenRequest, 
  TokenResponse, 
  User,
  UserRegistrationRequest
} from './types';
import { TokenStorage } from '../utils/token-storage';

export class AuthClient {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // For cookie-based auth we only need to store the user data
    // The auth tokens are handled by HttpOnly cookies
    TokenStorage.setUser(data.user);
    
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
    // Call the logout endpoint to clear server-side cookies
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
        },
      });

      if (!response.ok) {
        console.error('Logout failed on server');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }

    // Clear client-side storage regardless of server response
    TokenStorage.clearTokens();
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': TokenStorage.getCsrfToken() || '',
      },
    });

    if (!response.ok) {
      // If refresh fails, log out the user
      await this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // No need to store tokens as they're handled by cookies
    return data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    // Try to get from storage first
    const user = TokenStorage.getUser();
    if (user) return user;
    
    // Otherwise fetch from API (using HttpOnly cookies for authentication)
    const response = await fetch(`${this.apiUrl}/api/v1/auth/profile`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      if (response.status === 401) {
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