'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/validations/auth';
import { navigateTo, ROUTES } from '@/utils/navigation';
import { AUTH_ENDPOINTS } from '@qbit/auth-common';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      // Make a direct API call to the forgot password endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }
      
      setSuccess(true);
      
      // Optional: redirect after success message is shown for a few seconds
      setTimeout(() => {
        // Use navigation utility for any potential future navigation
        navigateTo(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setServerError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="p-5 w-full" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {serverError}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
          Password reset instructions have been sent to your email address.
        </div>
      )}
      
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          {...register('email')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
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