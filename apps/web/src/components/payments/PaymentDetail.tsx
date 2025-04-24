'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Payment, PaymentMethod, PaymentStatus } from '@qbit/shared-types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../ui/use-toast';
import { usePayments } from '@/hooks/usePayments';

const paymentStatusColorMap: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-200 text-yellow-800',
  COMPLETED: 'bg-green-200 text-green-800',
  FAILED: 'bg-red-200 text-red-800',
  REFUNDED: 'bg-purple-200 text-purple-800',
  PARTIALLY_REFUNDED: 'bg-blue-200 text-blue-800',
  CANCELLED: 'bg-gray-200 text-gray-800'
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CHECK: 'Check',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  BANK_TRANSFER: 'Bank Transfer',
  WIRE_TRANSFER: 'Wire Transfer',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe',
  OTHER: 'Other'
};

interface PaymentDetailProps {
  payment: Payment;
  onDelete?: () => void;
}

export default function PaymentDetail({ payment, onDelete }: PaymentDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { deletePayment } = usePayments({ autoFetch: false });
  
  const handleDelete = async () => {
    if (payment.status !== 'PENDING') {
      toast({
        title: "Cannot Delete",
        description: "Only pending payments can be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deletePayment(payment.id);
      
      if (success) {
        toast({
          title: "Payment Deleted",
          description: "The payment has been deleted successfully.",
        });
        
        if (onDelete) {
          onDelete();
        } else {
          router.push('/dashboard/payments');
        }
      } else {
        throw new Error("Failed to delete payment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Details</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge className={paymentStatusColorMap[payment.status]}>
              {payment.status}
            </Badge>
            {payment.referenceNumber && (
              <span className="text-sm text-gray-500">Ref: {payment.referenceNumber}</span>
            )}
          </div>
        </div>
        {payment.status === 'PENDING' && (
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Payment"}
          </Button>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Payment Date:</span>
              <span>{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Payment Method:</span>
              <span>{paymentMethodLabels[payment.paymentMethod]}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Amount:</span>
              <span className="font-bold">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.referenceNumber && (
              <div className="grid grid-cols-2">
                <span className="text-sm font-medium">Reference Number:</span>
                <span>{payment.referenceNumber}</span>
              </div>
            )}
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Status:</span>
              <span>
                <Badge className={paymentStatusColorMap[payment.status]}>
                  {payment.status}
                </Badge>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2">
                <span className="text-sm font-medium">Invoice:</span>
                <Link 
                  href={`/dashboard/invoices/${payment.invoiceId}`}
                  className="text-blue-600 hover:underline"
                >
                  View Invoice
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{payment.notes}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/payments">Back to Payments</Link>
        </Button>
      </div>
    </div>
  );
} 