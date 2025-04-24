'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '../ui/use-toast';
import { CreatePaymentRequest, PaymentMethod } from '@qbit/shared-types';

interface PaymentApplicationProps {
  invoiceId?: string;
  onPaymentApplied?: () => void;
}

export default function PaymentApplication({ invoiceId, onPaymentApplied }: PaymentApplicationProps) {
  const { toast } = useToast();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(invoiceId || null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isApplying, setIsApplying] = useState(false);
  
  // Fetch invoices with balances due
  const { invoices, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useInvoices({
    status: 'SENT',
    autoFetch: true
  });
  
  // Get payment hook for creating payments
  const { createPayment } = usePayments({ autoFetch: false });
  
  // Select invoice and set default payment amount
  useEffect(() => {
    if (selectedInvoiceId && invoices.length > 0) {
      const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);
      if (selectedInvoice) {
        setPaymentAmount(selectedInvoice.balanceDue);
      }
    }
  }, [selectedInvoiceId, invoices]);
  
  // Filter invoices to only those with balances due
  const invoicesWithBalanceDue = invoices.filter(invoice => invoice.balanceDue > 0);
  
  // If invoiceId is provided, filter to just that invoice
  const filteredInvoices = invoiceId 
    ? invoices.filter(invoice => invoice.id === invoiceId)
    : invoicesWithBalanceDue;
  
  const handleApplyPayment = async () => {
    if (!selectedInvoiceId) {
      toast({
        title: "Error",
        description: "Please select an invoice to apply payment to.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Payment amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);
    
    if (!selectedInvoice) {
      toast({
        title: "Error",
        description: "Selected invoice not found.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentAmount > selectedInvoice.balanceDue) {
      toast({
        title: "Error",
        description: `Payment amount cannot exceed balance due (${formatCurrency(selectedInvoice.balanceDue)}).`,
        variant: "destructive",
      });
      return;
    }
    
    setIsApplying(true);
    
    try {
      // Create the payment request
      const paymentRequest: CreatePaymentRequest = {
        invoiceId: selectedInvoiceId,
        paymentDate: new Date().toISOString(),
        amount: paymentAmount,
        paymentMethod: PaymentMethod.BANK_TRANSFER, // Default method
        referenceNumber: `Applied on ${new Date().toLocaleDateString()}`,
      };
      
      // Create the payment
      const result = await createPayment(paymentRequest);
      
      if (result) {
        toast({
          title: "Payment Applied",
          description: `Successfully applied ${formatCurrency(paymentAmount)} to invoice ${selectedInvoice.invoiceNumber}.`,
        });
        
        // Refresh invoices to get updated balances
        await refetchInvoices();
        
        // Reset form
        if (!invoiceId) {
          setSelectedInvoiceId(null);
        }
        setPaymentAmount(0);
        
        // Call callback if provided
        if (onPaymentApplied) {
          onPaymentApplied();
        }
      } else {
        throw new Error("Failed to apply payment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error applying the payment. Please try again.",
        variant: "destructive",
      });
      console.error('Error applying payment:', error);
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply Payment</CardTitle>
        <CardDescription>
          Apply a payment to an outstanding invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingInvoices ? (
          <div className="text-center py-4">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-4">No invoices with balances due found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className={invoice.id === selectedInvoiceId ? "bg-blue-50" : ""}
                  >
                    <TableCell>
                      <input 
                        type="radio" 
                        name="invoiceSelection" 
                        checked={invoice.id === selectedInvoiceId}
                        onChange={() => setSelectedInvoiceId(invoice.id)}
                        disabled={invoiceId !== undefined}
                      />
                    </TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(invoice.balanceDue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {selectedInvoiceId && (
              <div className="mt-6 space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Payment Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={handleApplyPayment} 
                    disabled={isApplying || paymentAmount <= 0}
                  >
                    {isApplying ? "Applying..." : "Apply Payment"}
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  This will create a payment record for the selected invoice.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 