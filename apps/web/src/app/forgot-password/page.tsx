'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full md:w-1/3 items-center max-w-4xl transition duration-1000 ease-out">
          <h2 className="p-3 text-3xl font-bold text-blue-600">Reset Password</h2>
          <div className="inline-block border-[1px] justify-center w-20 border-blue-600 border-solid"></div>
          <ForgotPasswordForm />
          <div className="text-gray-500 mt-4 mb-4">
            <p>Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 