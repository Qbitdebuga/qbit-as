'use client';

import { ReactNode, useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { navigateTo, ROUTES } from '@/utils/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

// Development mode flag - must match middleware
const DEV_MODE = true;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Set the date only after component has mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  const handleLogout = async () => {
    logout();
    
    // In dev mode, manually navigate to prevent loops
    if (DEV_MODE) {
      navigateTo(ROUTES.LOGIN, { replace: true });
    }
  };

  // Simple layout for development mode
  if (DEV_MODE) {
    return (
      <div className="flex h-screen">
        {/* Sidebar Component */}
        <DashboardSidebar 
          isDevMode={true}
          handleLogout={handleLogout}
        />
        
        {/* Main content */}
        <div className="flex-grow bg-gray-50 overflow-auto">
          {/* Header Component */}
          <DashboardHeader 
            currentDate={isMounted ? currentDate : ''}
          />
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Production mode with auth protection
  return (
    <ProtectedRoute>
      <div className="flex h-screen" suppressHydrationWarning>
        {/* Sidebar Component */}
        <DashboardSidebar 
          isDevMode={false}
          handleLogout={handleLogout}
        />
        
        {/* Main content */}
        <div className="flex-grow bg-gray-50 overflow-auto" suppressHydrationWarning>
          {/* Header Component */}
          <DashboardHeader 
            currentDate={isMounted ? currentDate : ''}
          />
          
          {/* Content */}
          <div className="p-6" suppressHydrationWarning>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 