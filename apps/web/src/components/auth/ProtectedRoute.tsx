'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth state is loaded
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
      }
      // If roles are required, check if user has at least one of the required roles
      else if (requiredRoles.length > 0) {
        const hasRequiredRole = user && user.roles ? 
          requiredRoles.some(role => user.roles.includes(role)) : 
          false;
        
        if (!hasRequiredRole) {
          // Redirect to dashboard or unauthorized page
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRoles, user]);

  // Show nothing while loading or redirecting
  if (isLoading || (!isAuthenticated && !isLoading)) {
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