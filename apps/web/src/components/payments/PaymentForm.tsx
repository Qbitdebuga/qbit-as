'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/components/ui/use-toast';
import { PaymentMethod, CreatePaymentRequest } from '@qbit/shared-types';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { formatCurrency } from '@/utils/formatters';

// Form schema
const paymentSchema = z.object({
  invoiceId: z.string().uuid('Please select an invoice'),
  paymentDate: z.date(),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Get invoice ID from query parameters if available
  const initialInvoiceId = searchParams.get('invoiceId');
  
  const { invoices, isLoading: isLoadingInvoices } = useInvoices({
    status: 'SENT',
    autoFetch: true
  });
  
  const { createPayment } = usePayments({ autoFetch: false });
  
  // Default form values
  const defaultValues: Partial<PaymentFormValues> = {
    paymentDate: new Date(),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    amount: 0,
  };

  // If initialInvoiceId exists, set it as default
  if (initialInvoiceId) {
    defaultValues.invoiceId = initialInvoiceId;
  }
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });

  // When the form loads, if invoiceId is set, fetch the invoice details
  useEffect(() => {
    const invoiceId = form.getValues('invoiceId');
    if (invoiceId && invoices.length > 0) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        // Set default amount to balance due
        form.setValue('amount', invoice.balanceDue);
      }
    }
  }, [form, invoices]);

  // When invoice selection changes, update amount
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      form.setValue('amount', invoice.balanceDue);
    } else {
      setSelectedInvoice(null);
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    
    try {
      const payment = await createPayment(data as CreatePaymentRequest);
      
      if (payment) {
        toast({
          title: "Payment Recorded",
          description: `Payment of ${formatCurrency(data.amount)} has been recorded successfully.`,
        });
        
        router.push('/dashboard/payments');
      } else {
        toast({
          title: "Error",
          description: "Failed to record payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: "There was an error recording the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Record New Payment</CardTitle>
            <CardDescription>
              Enter payment details to record a customer payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Selection */}
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInvoiceChange(value);
                    }} 
                    defaultValue={field.value}
                    disabled={isLoadingInvoices || !!initialInvoiceId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an invoice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingInvoices ? (
                        <SelectItem value="loading" disabled>Loading invoices...</SelectItem>
                      ) : invoices.length === 0 ? (
                        <SelectItem value="none" disabled>No unpaid invoices found</SelectItem>
                      ) : (
                        invoices
                          .filter(invoice => invoice.balanceDue > 0)
                          .map(invoice => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.invoiceNumber} - Balance: {formatCurrency(invoice.balanceDue)}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the invoice this payment applies to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Invoice Summary - only show when an invoice is selected */}
            {selectedInvoice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Invoice Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Invoice #:</span>
                  <span>{selectedInvoice.invoiceNumber}</span>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                  <span>Balance Due:</span>
                  <span className="font-bold">{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            )}
            
            {/* Payment Date */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  {selectedInvoice && (
                    <FormDescription>
                      Maximum amount: {formatCurrency(selectedInvoice.balanceDue)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                      <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
                      <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                      <SelectItem value={PaymentMethod.DEBIT_CARD}>Debit Card</SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                      <SelectItem value={PaymentMethod.WIRE_TRANSFER}>Wire Transfer</SelectItem>
                      <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                      <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                      <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Check #, Transaction ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    A reference number for this payment (check number, transaction ID, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this payment"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/payments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 