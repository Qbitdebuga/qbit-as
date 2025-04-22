'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/utils/auth';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("Attempting login with auth client URL:", process.env.NEXT_PUBLIC_AUTH_URL);
      // Use shared authClient instance
      await authClient.login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      // Display more detailed error message
      if (err.message === 'Failed to fetch') {
        setError('Connection error: Cannot reach authentication service. Please try again later or contact support.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="p-5 w-full" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
} 