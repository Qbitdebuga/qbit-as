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
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens and user data
    TokenStorage.setTokens(data.accessToken, data.refreshToken, data.user);
    
    return data;
  }

  /**
   * Logout user
   */
  logout(): void {
    TokenStorage.clearTokens();
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };
    
    const response = await fetch(`${this.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refreshRequest),
    });

    if (!response.ok) {
      // If refresh fails, log out the user
      this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update the tokens
    TokenStorage.updateAccessToken(data.accessToken);
    
    return data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    // Try to get from storage first
    const user = TokenStorage.getUser();
    if (user) return user;
    
    // Otherwise fetch from API
    const accessToken = TokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        try {
          await this.refreshToken();
          // Retry with the new token
          return this.getProfile();
        } catch (error) {
          this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  /**
   * Register new user
   */
  async register(userData: UserRegistrationRequest): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
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
    return TokenStorage.isAuthenticated();
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    const accessToken = TokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        try {
          await this.refreshToken();
          // Retry with the new token
          return this.getUsers();
        } catch (error) {
          this.logout();
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
    const accessToken = TokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        try {
          await this.refreshToken();
          return this.getUserById(userId);
        } catch (error) {
          this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw new Error('Failed to get user');
    }

    return response.json();
  }
} 