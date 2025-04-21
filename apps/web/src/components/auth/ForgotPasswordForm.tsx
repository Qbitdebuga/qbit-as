'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // In a real implementation, this would connect to the auth service
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage(`If an account exists for ${email}, you will receive a password reset email shortly.`);
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset instructions. Please try again.');
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
      
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2 text-left">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
      >
        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
      </button>
    </form>
  );
} 