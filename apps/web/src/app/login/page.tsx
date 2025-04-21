'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full md:w-1/3 items-center max-w-4xl transition duration-1000 ease-out">
          <h2 className="p-3 text-3xl font-bold text-blue-600">Login</h2>
          <div className="inline-block border-[1px] justify-center w-20 border-blue-600 border-solid"></div>
          <LoginForm />
          <div className="text-gray-500 mt-4 mb-4">
            <p>Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
            <p className="mt-2">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 