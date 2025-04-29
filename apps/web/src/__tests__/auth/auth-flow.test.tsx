import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { DEV_MODE } from '@qbit/auth-common';
import { authClient } from '@/utils/auth';
import { TokenStorage } from '@qbit/api-client/src/utils/token-storage';

// Mock the imports
jest.mock('@/utils/auth', () => ({
  authClient: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    isAuthenticated: jest.fn(),
  },
  hasRole: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hasAnyRole: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

jest.mock('@qbit/api-client/src/utils/token-storage', () => ({
  TokenStorage: {
    getUser: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('@qbit/auth-common', () => ({
  DEV_MODE: false,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Create a test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout, register, error } = useAuth();
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="auth-state">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <div data-testid="error-message">{error?.message || 'No Error'}</div>
      
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      
      <button 
        data-testid="register-button" 
        onClick={() => register('Test User', 'test@example.com', 'password')}
      >
        Register
      </button>
      
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(false);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(null);
  });
  
  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
  });
  
  it('should successfully login', async () => {
    // Mock successful login
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.login as jest.Mock).mockResolvedValue({ 
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Should show loading again
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Verify login was called with correct parameters
    expect(authClient.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password',
      rememberMe: false
    });
  });
  
  it('should handle login errors', async () => {
    // Mock login error
    (authClient.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });
  });
  
  it('should successfully register', async () => {
    // Mock successful register and login
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.register as jest.Mock).mockResolvedValue(true);
    (authClient.login as jest.Mock).mockResolvedValue({ 
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click register button
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Should show loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Verify register was called with correct parameters
    expect(authClient.register).toHaveBeenCalledWith({ 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password'
    });
    
    // Verify login was called after successful registration
    expect(authClient.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password'
    });
  });
  
  it('should handle registration errors', async () => {
    // Mock registration error
    (authClient.register as jest.Mock).mockRejectedValue(new Error('Email already in use'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click register button
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email already in use');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });
  });
  
  it('should log out successfully', async () => {
    // Mock authenticated user initially
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
    
    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Verify user is logged out
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
    
    // Verify authClient.logout was called
    expect(authClient.logout).toHaveBeenCalled();
  });
  
  it('should restore user session from storage', async () => {
    // Mock authenticated user in storage
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth state to be restored
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Verify getUser was called
    expect(TokenStorage.getUser).toHaveBeenCalled();
  });
  
  it('should handle session expiration', async () => {
    // Mock authenticated user in storage but expired token
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    (authClient.getProfile as jest.Mock).mockRejectedValue(new Error('Token expired'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth state to be checked
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Should show error and clear auth state
    expect(screen.getByTestId('error-message')).not.toHaveTextContent('No Error');
    expect(authClient.logout).toHaveBeenCalled(); // Should log out on expired token
  });
  
  it('should bypass authentication in DEV_MODE', async () => {
    // Mock DEV_MODE to be true
    jest.resetModules();
    jest.mock('@qbit/auth-common', () => ({
      DEV_MODE: true,
    }));
    
    // Re-import with new mock
    const { AuthProvider, useAuth } = require('@/contexts/auth-context');
    
    const DevModeComponent = () => {
      const { isAuthenticated, isLoading } = useAuth();
      return (
        <div>
          <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
          <div data-testid="auth-state">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
          <div data-testid="dev-mode-state">DEV_MODE is ON</div>
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <DevModeComponent />
      </AuthProvider>
    );
    
    // In DEV_MODE, should not interact with auth APIs
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    expect(authClient.getProfile).not.toHaveBeenCalled();
  });
}); 