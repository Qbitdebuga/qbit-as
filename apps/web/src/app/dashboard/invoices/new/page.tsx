'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { isUserAuthenticated } from '@/utils/auth-helpers';

export default function NewInvoicePage() {
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm />
    </div>
  );
}
