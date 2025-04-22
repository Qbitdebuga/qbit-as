'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/utils/auth';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting registration with auth client URL:", process.env.NEXT_PUBLIC_AUTH_URL);
      // Use the shared authClient instance
      await authClient.register({ email, name, password });
      
      // Auto-login after registration
      await authClient.login({ email, password });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      // Display more detailed error message
      if (err.message === 'Failed to fetch') {
        setError('Connection error: Cannot reach authentication service. Please try again later or contact support.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      
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
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
} 