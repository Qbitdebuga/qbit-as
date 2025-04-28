'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invoice, InvoiceItem, InvoiceStatus, PaymentMethod } from '@qbit/shared-types';
import { formatCurrency, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const statusColorMap: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-200 text-gray-800',
  PENDING: 'bg-yellow-200 text-yellow-800',
  SENT: 'bg-blue-200 text-blue-800',
  PARTIAL: 'bg-purple-200 text-purple-800',
  PAID: 'bg-green-200 text-green-800',
  OVERDUE: 'bg-red-200 text-red-800',
  VOID: 'bg-gray-200 text-gray-800 line-through',
  CANCELLED: 'bg-gray-200 text-gray-800 line-through',
};

interface PaymentDialogProps {
  invoiceId: string;
  onPaymentRecorded: () => void;
}

function RecordPaymentDialog({ invoiceId, onPaymentRecorded }: PaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);

    try {
      // Here you would call your API to record the payment
      // await apiClient.invoices.createPayment(invoiceId, {
      //   amount: parseFloat(amount),
      //   paymentMethod,
      //   referenceNumber,
      //   paymentDate: new Date()
      // });

      toast({
        title: 'Payment recorded',
        description: `Payment of ${formatCurrency(parseFloat(amount))} has been recorded.`,
      });

      onPaymentRecorded();
    } catch (error) {
      toast({
        title: 'Error recording payment',
        description: 'There was an error recording the payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Record Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Payment Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border rounded p-2"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="paymentMethod" className="text-sm font-medium">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="border rounded p-2"
              required
            >
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.CHECK}>Check</option>
              <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
              <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
              <option value={PaymentMethod.WIRE_TRANSFER}>Wire Transfer</option>
              <option value={PaymentMethod.PAYPAL}>PayPal</option>
              <option value={PaymentMethod.STRIPE}>Stripe</option>
              <option value={PaymentMethod.OTHER}>Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="referenceNumber" className="text-sm font-medium">
              Reference Number
            </label>
            <input
              id="referenceNumber"
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., Check #1234 or Transaction ID"
              className="border rounded p-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface InvoiceDetailProps {
  invoice: Invoice;
  onStatusChange?: () => void;
}

export default function InvoiceDetail({ invoice, onStatusChange }: InvoiceDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setIsDeleting(true);

      try {
        // await apiClient.invoices.deleteInvoice(invoice.id);
        toast({
          title: 'Invoice deleted',
          description: 'The invoice has been successfully deleted.',
        });
        router.push('/dashboard/invoices');
      } catch (error) {
        toast({
          title: 'Error deleting invoice',
          description: 'There was an error deleting the invoice. Please try again.',
          variant: 'destructive',
        });
        setIsDeleting(false);
      }
    }
  };

  const handleFinalize = async () => {
    try {
      // await apiClient.invoices.finalizeInvoice(invoice.id);
      toast({
        title: 'Invoice finalized',
        description: 'The invoice has been finalized and is ready to be sent.',
      });
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error finalizing invoice',
        description: 'There was an error finalizing the invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSent = async () => {
    try {
      // await apiClient.invoices.markInvoiceAsSent(invoice.id);
      toast({
        title: 'Invoice marked as sent',
        description: 'The invoice has been marked as sent to the customer.',
      });
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error marking invoice as sent',
        description: 'There was an error marking the invoice as sent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVoid = async () => {
    if (
      window.confirm('Are you sure you want to void this invoice? This action cannot be undone.')
    ) {
      try {
        // await apiClient.invoices.voidInvoice(invoice.id);
        toast({
          title: 'Invoice voided',
          description: 'The invoice has been voided successfully.',
        });
        onStatusChange?.();
      } catch (error) {
        toast({
          title: 'Error voiding invoice',
          description: 'There was an error voiding the invoice. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePaymentRecorded = () => {
    onStatusChange?.();
  };

  const canEdit = invoice.status === InvoiceStatus.DRAFT;
  const canFinalize = invoice.status === InvoiceStatus.DRAFT;
  const canMarkAsSent = invoice.status === InvoiceStatus.PENDING;
  const canRecordPayment = [
    InvoiceStatus.PENDING,
    InvoiceStatus.SENT,
    InvoiceStatus.PARTIAL,
    InvoiceStatus.OVERDUE,
  ].includes(invoice.status);
  const canVoid = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.PENDING,
    InvoiceStatus.SENT,
    InvoiceStatus.PARTIAL,
    InvoiceStatus.OVERDUE,
  ].includes(invoice.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge className={statusColorMap[invoice.status]}>{invoice.status}</Badge>
            {invoice.customerReference && (
              <span className="text-sm text-gray-500">
                Customer Ref: {invoice.customerReference}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <Button variant="outline" onClick={handleEdit}>
              Edit
            </Button>
          )}
          {canFinalize && (
            <Button variant="default" onClick={handleFinalize}>
              Finalize
            </Button>
          )}
          {canMarkAsSent && (
            <Button variant="default" onClick={handleMarkAsSent}>
              Mark as Sent
            </Button>
          )}
          {canRecordPayment && (
            <RecordPaymentDialog invoiceId={invoice.id} onPaymentRecorded={handlePaymentRecorded} />
          )}
          {canVoid && (
            <Button variant="outline" onClick={handleVoid}>
              Void
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Invoice Date:</span>
              <span>{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Due Date:</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm font-medium">Amount Due:</span>
              <span className="font-bold">{formatCurrency(invoice.balanceDue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1">
              <Link
                href={`/dashboard/customers/${invoice.customerId}`}
                className="text-blue-600 hover:underline"
              >
                {/* Replace with actual customer name */}
                View Customer
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.description}
                      {item.itemCode && (
                        <div className="text-xs text-gray-500">Item Code: {item.itemCode}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.lineTotal)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No items on this invoice
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxAmount && invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.terms && (
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{invoice.terms}</p>
          </CardContent>
        </Card>
      )}

      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.referenceNumber || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoices">Back to Invoices</Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Print Invoice
        </Button>
      </div>
    </div>
  );
}
