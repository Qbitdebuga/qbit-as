import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/auth-context';
import { DEV_MODE } from '@qbit/auth-common';
import { authClient } from '@/utils/auth';
import { TokenStorage } from '@qbit/api-client/src/utils/token-storage';
import { ROUTES } from '@/utils/navigation';

// Mock the modules
jest.mock('@/utils/auth', () => ({
  authClient: {
    getProfile: jest.fn(),
    isAuthenticated: jest.fn(),
    logout: jest.fn(),
  },
  hasRole: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hasAnyRole: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

jest.mock('@qbit/api-client/src/utils/token-storage', () => ({
  TokenStorage: {
    getUser: jest.fn(),
  },
}));

jest.mock('@qbit/auth-common', () => ({
  DEV_MODE: false,
}));

// Mock navigation utility
const mockNavigate = jest.fn();
jest.mock('@/utils/navigation', () => ({
  navigateTo: jest.fn((route) => mockNavigate(route)),
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default authentication state
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(false);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(null);
  });
  
  it('should show loading indicator initially', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Should show loading initially
    expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
    
    // Content should not be visible during loading
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should redirect unauthenticated users to login', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should have redirected to login
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
    
    // Protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should display content for authenticated users', async () => {
    // Mock authenticated user
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should display the protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not have redirected
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('should redirect users without required roles to dashboard', async () => {
    // Mock authenticated user with insufficient roles
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <ProtectedRoute requiredRoles={['admin']} checkRoles={true}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should have redirected to dashboard
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, { replace: true });
    
    // Admin content should not be visible
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });
  
  it('should display content for users with required roles', async () => {
    // Mock authenticated admin user
    const mockUser = { id: '1', email: 'admin@example.com', name: 'Admin User', roles: ['admin', 'user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <ProtectedRoute requiredRoles={['admin']} checkRoles={true}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should display the admin content
    expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
    
    // Should not have redirected
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('should allow access to any authenticated user when role checking is disabled', async () => {
    // Mock authenticated user without admin role
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <ProtectedRoute requiredRoles={['admin']} checkRoles={false}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should display the content even without admin role
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not have redirected
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('should honor custom redirect paths', async () => {
    // Mock unauthenticated user
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(false);
    
    render(
      <AuthProvider>
        <ProtectedRoute redirectTo="/custom-login">
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should have redirected to custom login path
    expect(mockNavigate).toHaveBeenCalledWith('/custom-login', { replace: true });
  });
  
  it('should bypass auth checks in DEV_MODE', async () => {
    // Mock DEV_MODE to be true
    jest.resetModules();
    jest.mock('@qbit/auth-common', () => ({
      DEV_MODE: true,
    }));
    
    // Re-import with new mock
    const { ProtectedRoute } = require('@/components/auth/ProtectedRoute');
    
    render(
      <AuthProvider>
        <ProtectedRoute requiredRoles={['admin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // In DEV_MODE, content should be immediately visible
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not have checked authentication
    expect(authClient.isAuthenticated).not.toHaveBeenCalled();
    
    // Should not have redirected
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('should display access denied when user has insufficient permissions', async () => {
    // Mock authenticated user with insufficient roles
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', roles: ['user'] };
    (authClient.isAuthenticated as jest.Mock).mockReturnValue(true);
    (TokenStorage.getUser as jest.Mock).mockReturnValue(mockUser);
    
    // This is a special case where we're testing what happens when the ProtectedRoute
    // decides to render the Permission Denied UI instead of redirecting
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Silence console logs
    
    // Modify the navigateTo mock to not actually navigate for this test
    (require('@/utils/navigation').navigateTo as jest.Mock).mockImplementation(() => {
      // Do nothing - this simulates a case where navigation is blocked
    });
    
    render(
      <AuthProvider>
        <ProtectedRoute requiredRoles={['admin']} checkRoles={true}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
    
    // Should show access denied message
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    
    // Admin content should not be visible
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });
}); 