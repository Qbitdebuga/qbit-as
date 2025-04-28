'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import PaymentDetail from '@/components/payments/PaymentDetail';
import { useVendorPayments } from '@/hooks/useVendorPayments';
import { Payment } from '@/mocks/shared-types';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get vendor payments hook with autoFetch set to false since we'll fetch by ID
  const { payments, error, refetch } = useVendorPayments({ autoFetch: false });

  // Get payment ID from route params
  const paymentId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) {
        router.push('/dashboard/payments');
        return;
      }

      setIsLoading(true);

      try {
        // In a real app, we would call a hook function to fetch a single payment by ID
        // For now, we'll simulate this by fetching all payments and finding the one we need
        await refetch();

        // Find the payment in the data
        const foundPayment = payments.find((p) => p.id === paymentId);

        if (!foundPayment) {
          toast({
            title: 'Payment not found',
            description: 'The requested vendor payment could not be found.',
            variant: 'destructive',
          });
          router.push('/dashboard/payments');
          return;
        }

        setPayment(foundPayment);
      } catch (error) {
        console.error('Error loading vendor payment:', error);
        toast({
          title: 'Error',
          description: 'There was an error loading the vendor payment. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
  }, [paymentId, payments, refetch, router, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Vendor Payment Details</h1>
        <div className="text-center py-10">Loading payment details...</div>
      </div>
    );
  }

  if (!payment) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Vendor Payment Details</h1>
      <PaymentDetail payment={payment} onDelete={() => router.push('/dashboard/payments')} />
    </div>
  );
}
