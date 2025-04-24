'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Payment, PaymentMethod, PaymentStatus } from '@qbit/shared-types';
import { usePayments } from '@/hooks/usePayments';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '../ui/use-toast';

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

interface PaymentListProps {
  invoiceId?: string;
}

export default function PaymentList({ invoiceId }: PaymentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { payments, isLoading, error, refetch, deletePayment } = usePayments({
    invoiceId,
    autoFetch: true
  });
  
  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }
    
    const success = await deletePayment(id);
    
    if (success) {
      toast({
        title: 'Payment Deleted',
        description: 'The payment has been deleted successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete the payment. Only pending payments can be deleted.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter payments based on search term and status
  const filteredPayments = payments
    .filter(payment => {
      // Filter by status if not "ALL"
      if (statusFilter !== 'ALL' && payment.status !== statusFilter) {
        return false;
      }
      
      // Search by reference number
      if (payment.referenceNumber && 
          payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // Default to true if no search term
      return searchTerm === '';
    });

  const handleCreateNew = () => {
    if (invoiceId) {
      router.push(`/dashboard/payments/new?invoiceId=${invoiceId}`);
    } else {
      router.push('/dashboard/payments/new');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {invoiceId ? 'Payments for this invoice' : 'Manage customer payments'}
          </CardDescription>
        </div>
        {!invoiceId && (
          <Button onClick={handleCreateNew}>Record New Payment</Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="w-1/3">
            <Input
              placeholder="Search by reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-1/4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading payments...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading payments: {error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/invoices/${payment.invoiceId}`} className="text-blue-600 hover:underline">
                        View Invoice
                      </Link>
                    </TableCell>
                    <TableCell>{paymentMethodLabels[payment.paymentMethod]}</TableCell>
                    <TableCell>{payment.referenceNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColorMap[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/payments/${payment.id}`}>View</Link>
                        </Button>
                        {payment.status === 'PENDING' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 