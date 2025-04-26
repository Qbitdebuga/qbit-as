'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { invoicesClient } from '@/utils/api-clients';
import { isUserAuthenticated, setupAuthForClient } from '@/utils/auth-helpers';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { Invoice } from '@qbit-accounting/shared-types';
import Link from 'next/link';

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params?.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchInvoice = async () => {
      try {
        setupAuthForClient(invoicesClient);
        const data = await invoicesClient.getInvoiceById(id);
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Convert the API invoice data to the format expected by InvoiceForm
  const formattedInvoice = invoice ? {
    id: invoice.id,
    customerId: invoice.customerId,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: new Date(invoice.invoiceDate),
    dueDate: new Date(invoice.dueDate),
    status: invoice.status,
    notes: invoice.notes || '',
    lineItems: invoice.items?.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productId: item.itemCode || ''  // Use itemCode as productId if available
    })) || []
  } : undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/invoices/${id}`}>Back to Invoice</Link>
        </Button>
      </div>
      {formattedInvoice && <InvoiceForm initialData={formattedInvoice} isEditing={true} />}
    </div>
  );
} 