'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  // Move all logic to the main component, not a nested component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirectTo path from URL query params
  const redirectTo = searchParams?.get('redirectTo') || '/dashboard';

  // Redirection logic for authenticated users - run only once on mount
  useEffect(() => {
    // Skip server-side rendering
    if (typeof window === 'undefined') return;
    
    const isLoginPage = window.location.pathname === '/login';
    
    if (isAuthenticated && isLoginPage) {
      console.log(`[Login] User already authenticated, redirecting to ${redirectTo}`);
      
      // Use router.replace() to avoid adding to history, preventing back button issues
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log(`[Login] Attempting login with email: ${email}`);
      const response = await login(email, password);
      
      if (response) {
        console.log(`[Login] Login successful, redirecting to: ${redirectTo}`);
        
        // Force a hard navigation to ensure state is reset properly
        window.location.href = redirectTo;
        
        // Don't use router for this case as it causes state issues
        // router.replace(redirectTo);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if automatically redirecting
  if (isAuthenticated && typeof window !== 'undefined') {
    return <div className="p-8 text-center">Redirecting to dashboard...</div>;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">QBit Accounting</CardTitle>
          <div className="text-center text-sm text-gray-500">Enter your credentials to access your account</div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 