'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Component to display dashboard content
function DashboardContent({ user, isAuthenticated, isLoading, logout }: {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}) {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Development Mode: Yes</p>
              <p>User: {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
              {isAuthenticated && (
                <Button 
                  variant="destructive" 
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">View Reports</Button>
              <Button variant="outline">Manage Accounts</Button>
              <Button variant="outline">Transactions</Button>
              <Button variant="outline">Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout, checkAuthManually } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Only perform client-side operations after mount
  useEffect(() => {
    setIsMounted(true);
    
    // Force auth check to ensure fresh data
    const initDashboard = async () => {
      await checkAuthManually();
    };
    
    initDashboard();
  }, [checkAuthManually]);

  // Server-side or loading state
  if (!isMounted) {
    return (
      <div className="container py-10">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-center">
            <p className="text-xl font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Client-side render
  return (
    <DashboardContent 
      user={user}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      logout={logout}
    />
  );
} 