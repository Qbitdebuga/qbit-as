'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DEV_MODE } from '@qbit/auth-common';
import { navigateTo, ROUTES } from '@/utils/navigation';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { RoleName } from '@qbit/api-client/src/auth/types';
import { ErrorDetails } from '@/utils/error-handler';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Children to render when the route is accessible */
  children: ReactNode;
  
  /** Required roles for accessing this route (any one required role is sufficient) */
  requiredRoles?: RoleName[];
  
  /** 
   * Custom route to redirect to if authentication fails 
   * @default ROUTES.LOGIN
   */
  redirectTo?: string;
  
  /**
   * Whether to perform role checking
   * @default true
   */
  checkRoles?: boolean;
}

/**
 * Component that protects routes by checking authentication and roles.
 * Will redirect to login or dashboard based on authentication status and roles.
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectTo = ROUTES.LOGIN,
  checkRoles = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, checkAuthStatus, hasRole } = useAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<ErrorDetails | null>(null);

  // Only check auth client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Skip all checks in dev mode
    if (DEV_MODE) return;

    try {
      // Force a check on route changes (helpful for protected routes)
      checkAuthStatus();
    } catch (err) {
      console.error('[ProtectedRoute] Error checking auth status:', err);
      setError({
        type: 'auth',
        message: 'Authentication verification failed',
        code: 'AUTH_VERIFICATION_FAILED',
        original: err
      });
    }
  }, [checkAuthStatus]);

  // Handle auth state changes
  useEffect(() => {
    // Skip all checks in dev mode
    if (DEV_MODE) return;
    
    // Wait until auth state is loaded and component is mounted
    if (!isLoading && isMounted) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log('[ProtectedRoute] User not authenticated, redirecting to login');
        // Use navigation utility instead of window.location.href
        navigateTo(redirectTo, { replace: true });
        return;
      }
      
      // If roles are required and checking is enabled, validate roles
      if (checkRoles && requiredRoles.length > 0) {
        const hasRequiredRole = hasRole(requiredRoles);
        
        if (!hasRequiredRole) {
          console.log('[ProtectedRoute] User missing required role, redirecting to dashboard');
          // Use navigation utility instead of window.location.href
          navigateTo(ROUTES.DASHBOARD, { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, isMounted, requiredRoles, redirectTo, checkRoles, hasRole]);

  // In dev mode, skip auth checks
  if (DEV_MODE) {
    return <>{children}</>;
  }

  // Show error if there was a problem checking auth
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorDisplay
          title="Authentication Error"
          message={error.message}
          severity="error"
          retry={() => {
            setError(null);
            checkAuthStatus();
          }}
        />
      </div>
    );
  }

  // Show loading state while checking auth or before client-side mount
  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  // If not authenticated client-side, show empty loading state (will redirect soon)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="lg" text="Redirecting..." />
      </div>
    );
  }

  // If roles are required and role checking is enabled, validate roles
  if (checkRoles && requiredRoles.length > 0) {
    const hasRequiredRole = hasRole(requiredRoles);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <ErrorDisplay
            title="Access Denied"
            message={`You don't have permission to access this page. Required roles: ${requiredRoles.join(', ')}`}
            severity="warning"
          />
        </div>
      );
    }
  }

  // Render children if authenticated and has required roles
  return <>{children}</>;
} 