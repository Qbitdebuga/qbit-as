'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Development mode flag - must match middleware and useAuth
const DEV_MODE = true;

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Only check auth client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Skip all checks in dev mode
    if (DEV_MODE) return;
    
    // Wait until auth state is loaded
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log('[ProtectedRoute] User not authenticated, redirecting to login');
        // Use window.location for clean navigation
        window.location.href = '/login';
        return;
      }
      
      // If roles are required, check if user has at least one of the required roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = user && user.roles ? 
          requiredRoles.some(role => user.roles.includes(role)) : 
          false;
        
        if (!hasRequiredRole) {
          console.log('[ProtectedRoute] User missing required role, redirecting to dashboard');
          // Redirect to dashboard or unauthorized page
          window.location.href = '/dashboard';
        }
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRoles, user]);

  // In dev mode, skip auth checks
  if (DEV_MODE) {
    return <>{children}</>;
  }

  // Show nothing while loading or before client-side mount
  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" suppressHydrationWarning></div>
      </div>
    );
  }

  // If not authenticated client-side, show empty loading state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" suppressHydrationWarning></div>
      </div>
    );
  }

  // If roles are required, check if user has at least one of the required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user && user.roles ? 
      requiredRoles.some(role => user.roles.includes(role)) : 
      false;
    
    if (!hasRequiredRole) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
          <p className="mt-2">You don't have permission to access this page.</p>
        </div>
      );
    }
  }

  // Render children if authenticated and has required roles
  return <>{children}</>;
} 