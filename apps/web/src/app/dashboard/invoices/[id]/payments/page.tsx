'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentStatus } from '@/mocks/shared-types';
import { paymentsClient } from '@/utils/api-clients';
import { useToast } from '@/components/ui/use-toast';
import { getAuthToken } from '@/utils/auth-helpers';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function InvoicePaymentsPage() {
  const params = useParams();
  const { addToast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get invoice ID from route params
  const invoiceId = params?.id ? (typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '') : '';
  
  useEffect(() => {
    // Check if we have an invoice ID
    if (!invoiceId) {
      setError(new Error('Invalid invoice ID'));
      setIsLoading(false);
      return;
    }
    
    async function fetchPayments() {
      try {
        // Set auth token if available
        const token = getAuthToken();
        // Token handling will be done internally by the client
        
        // Fetch payments for this invoice
        if (invoiceId) {
          const data = await paymentsClient.getPaymentsByInvoiceId(invoiceId);
          setPayments(data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        addToast({
          title: 'Error',
          description: 'Failed to load payments for this invoice',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPayments();
  }, [invoiceId, addToast]);
  
  // Helper function to get status badge class
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'bg-blue-100 text-blue-800';
      case PaymentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoice Payments</h1>
        <Link href={`/dashboard/invoices/${invoiceId}`}>
          <Button variant="outline">Back to Invoice</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            All payments for invoice #{invoiceId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Failed to load payments. Please try again.
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found for this invoice.</p>
              <Link href={`/dashboard/payments/new?invoiceId=${invoiceId}`}>
                <Button className="mt-4">Record Payment</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{formatDate(payment.paymentDate)}</td>
                      <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-2">{payment.paymentMethod}</td>
                      <td className="px-4 py-2">{payment.referenceNumber || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/dashboard/payments/${payment.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 