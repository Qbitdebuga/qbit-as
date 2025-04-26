'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/lib/validations/auth';
import { authClient } from '@/utils/auth';

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    setIsLoading(true);

    try {
      console.log("Attempting registration with auth client URL:", process.env.NEXT_PUBLIC_AUTH_URL);
      // Use the shared authClient instance
      await authClient.register({ 
        email: data.email, 
        name: data.name, 
        password: data.password 
      });
      
      // Auto-login after registration
      await authClient.login({ 
        email: data.email, 
        password: data.password 
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      // Display more detailed error message
      if (err.message === 'Failed to fetch') {
        setServerError('Connection error: Cannot reach authentication service. Please try again later or contact support.');
      } else {
        setServerError(err.message || 'Registration failed. Please try again.');
      }
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
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Full Name"
          {...register('name')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      
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
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
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