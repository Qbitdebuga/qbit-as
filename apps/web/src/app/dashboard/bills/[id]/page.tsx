'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileEdit,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { Bill, BillStatus } from '@/mocks/shared-types';
import { billsClient } from '@/mocks/api-client';
import { useAuth } from '@/hooks/useAuth';
import { setupAuthForClient } from '@/utils/auth-helpers';
import BillDetail from '@/components/bills/BillDetail';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui';
import { toast } from '@/components/ui/use-toast';

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params ? (params.id as string) : '';

  useEffect(() => {
    if (isAuthenticated && id) {
      setupAuthForClient(billsClient);
      fetchBill();
    }
  }, [isAuthenticated, id]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billsClient.getBillById(id);
      setBill(data);
    } catch (err) {
      console.error('Error fetching bill:', err);
      setError('Failed to load bill details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await billsClient.approveBill(id);
      await fetchBill();
      toast({
        title: 'Bill Approved',
        description: 'The bill has been approved successfully.',
      });
    } catch (err) {
      console.error('Error approving bill:', err);
      toast({
        title: 'Failed to Approve',
        description: 'There was an error approving the bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await billsClient.cancelBill(id);
      await fetchBill();
      toast({
        title: 'Bill Cancelled',
        description: 'The bill has been cancelled successfully.',
      });
    } catch (err) {
      console.error('Error cancelling bill:', err);
      toast({
        title: 'Failed to Cancel',
        description: 'There was an error cancelling the bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canApprove =
    bill && [BillStatus.DRAFT, BillStatus.PENDING].includes(bill.status as BillStatus);
  const canCancel = bill && bill.status !== BillStatus.CANCELLED;
  const canEdit =
    bill && [BillStatus.DRAFT, BillStatus.PENDING].includes(bill.status as BillStatus);
  const canPay =
    bill && [BillStatus.APPROVED, BillStatus.PARTIAL].includes(bill.status as BillStatus);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/bills">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bills
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-6">
              <AlertCircle className="h-10 w-10 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium">Error Loading Bill</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/bills">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bills
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Bill not found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/dashboard/bills">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bills
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Bill #{bill.billNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link href={`/dashboard/bills/${id}/edit`}>
              <Button variant="outline">
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}

          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          {canPay && (
            <Link href={`/dashboard/payments/new?billId=${id}`}>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </Link>
          )}

          {canApprove && (
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Bill
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this bill?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will cancel the bill and it will no longer be
                    valid.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Nevermind</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Yes, cancel bill</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
          <CardDescription>View complete information about this bill</CardDescription>
        </CardHeader>
        <CardContent>
          <BillDetail bill={bill} />
        </CardContent>
      </Card>
    </div>
  );
}
