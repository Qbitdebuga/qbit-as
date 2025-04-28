'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import InvoiceDetail from '@/components/invoices/InvoiceDetail';
import { useInvoices } from '@/hooks/useInvoices';
import { Invoice } from '@/mocks/shared-types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchById, refetch } = useInvoices({ autoFetch: false });

  const invoiceId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) {
        router.push('/dashboard/invoices');
        return;
      }

      setIsLoading(true);

      try {
        const data = await fetchById(invoiceId);

        if (!data) {
          toast({
            title: 'Invoice not found',
            description: 'The requested invoice could not be found.',
            variant: 'destructive',
          });
          router.push('/dashboard/invoices');
          return;
        }

        setInvoice(data);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          title: 'Error',
          description: 'There was an error loading the invoice. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, fetchById, router, toast]);

  const handleStatusChange = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Invoice Details</h1>
        <div className="text-center py-10">Loading invoice details...</div>
      </div>
    );
  }

  if (!invoice) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Invoice Details</h1>
      <InvoiceDetail invoice={invoice} onStatusChange={handleStatusChange} />
    </div>
  );
}
