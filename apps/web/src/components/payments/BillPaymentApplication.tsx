'use client';

import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useVendorBills } from '@/hooks/useVendorBills';
import { useVendorPayments } from '@/hooks/useVendorPayments';
import { Bill, Payment, BillStatus } from '@qbit/shared-types';

interface BillPaymentApplicationProps {
  vendorId: string | number;
  payment?: Payment;
  onComplete?: (payment: Payment) => void;
}

export default function BillPaymentApplication({ 
  vendorId, 
  payment, 
  onComplete 
}: BillPaymentApplicationProps) {
  const { toast } = useToast();
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Fetch vendor's open bills
  const { bills, isLoading: isLoadingBills } = useVendorBills({
    vendorId,
    status: ['PENDING', 'APPROVED', 'PARTIALLY_PAID', 'OVERDUE'],
    autoFetch: true
  });
  
  // Setup hooks for payment application
  const { applyPayment, createPayment } = useVendorPayments();
  
  // Initialize total amount from payment if provided
  useEffect(() => {
    if (payment) {
      setTotalAmount(payment.amount);
      setRemainingAmount(payment.amount);
      
      // If payment has existing applications, pre-populate form
      if (payment.applications && payment.applications.length > 0) {
        const appliedBillIds: string[] = [];
        const appliedAmounts: Record<string, number> = {};
        
        payment.applications.forEach(app => {
          appliedBillIds.push(app.billId.toString());
          appliedAmounts[app.billId.toString()] = app.amount;
        });
        
        setSelectedBillIds(appliedBillIds);
        setAmounts(appliedAmounts);
        
        // Calculate remaining amount
        const appliedTotal = payment.applications.reduce((sum, app) => sum + app.amount, 0);
        setRemainingAmount(payment.amount - appliedTotal);
      }
    }
  }, [payment]);
  
  // Calculate remaining amount whenever selected bills or amounts change
  useEffect(() => {
    const appliedTotal = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
    setRemainingAmount(totalAmount - appliedTotal);
  }, [amounts, totalAmount]);
  
  const handleBillSelect = (billId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedBillIds(prev => [...prev, billId]);
      
      // Auto-populate amount with the bill's balance due if available
      const bill = bills.find(b => b.id.toString() === billId);
      if (bill) {
        // Use the minimum of remaining amount or bill balance
        const amountToApply = Math.min(bill.balanceDue, remainingAmount);
        if (amountToApply > 0) {
          setAmounts(prev => ({
            ...prev,
            [billId]: amountToApply
          }));
        }
      }
    } else {
      setSelectedBillIds(prev => prev.filter(id => id !== billId));
      
      // Remove amount for deselected bill
      setAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[billId];
        return newAmounts;
      });
    }
  };
  
  const handleAmountChange = (billId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    
    // Find the bill to get its balance
    const bill = bills.find(b => b.id.toString() === billId);
    
    if (bill) {
      // Ensure amount doesn't exceed bill's balance due
      const validAmount = Math.min(numAmount, bill.balanceDue);
      
      setAmounts(prev => ({
        ...prev,
        [billId]: validAmount
      }));
    }
  };
  
  const handleApplyPayment = async () => {
    // Validate if there are any bills selected
    if (selectedBillIds.length === 0) {
      toast({
        title: "No Bills Selected",
        description: "Please select at least one bill to apply payment to.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate if all amounts are greater than zero
    const hasInvalidAmounts = selectedBillIds.some(billId => !amounts[billId] || amounts[billId] <= 0);
    if (hasInvalidAmounts) {
      toast({
        title: "Invalid Amounts",
        description: "Please ensure all selected bills have valid payment amounts.",
        variant: "destructive",
      });
      return;
    }
    
    // Create application data
    const applications = selectedBillIds.map(billId => ({
      billId: parseInt(billId),
      amount: amounts[billId]
    }));
    
    try {
      let result;
      
      if (payment) {
        // Apply payment to existing payment
        result = await applyPayment({
          paymentId: payment.id,
          applications
        });
      } else {
        // Create a new payment with applications
        result = await createPayment({
          vendorId: parseInt(vendorId.toString()),
          paymentDate: new Date().toISOString(),
          amount: applications.reduce((sum, app) => sum + app.amount, 0),
          paymentMethod: 'BANK_TRANSFER', // Default method
          applications
        });
      }
      
      if (result) {
        toast({
          title: "Payment Applied Successfully",
          description: "The payment has been applied to the selected bills.",
        });
        
        if (onComplete) {
          onComplete(result);
        }
      }
    } catch (error) {
      console.error('Error applying payment:', error);
      toast({
        title: "Error",
        description: "Failed to apply payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const billStatusColorMap: Record<BillStatus, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    PENDING: 'bg-yellow-200 text-yellow-800',
    APPROVED: 'bg-blue-200 text-blue-800',
    PAID: 'bg-green-200 text-green-800',
    PARTIALLY_PAID: 'bg-purple-200 text-purple-800',
    OVERDUE: 'bg-red-200 text-red-800',
    VOID: 'bg-gray-200 text-gray-800',
    CANCELLED: 'bg-gray-200 text-gray-800'
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Apply Payment to Bills</CardTitle>
        <CardDescription>
          Select bills to apply this payment to
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-md">
          <div className="flex justify-between">
            <div>
              <Label>Total Payment Amount</Label>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div>
              <Label>Remaining Amount</Label>
              <div className={`text-2xl font-bold ${remainingAmount < 0 ? 'text-red-500' : remainingAmount === 0 ? 'text-green-600' : ''}`}>
                {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>
        </div>
        
        {isLoadingBills ? (
          <div className="text-center py-10">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-10">No open bills found for this vendor</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-right">Amount to Apply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => {
                const billId = bill.id.toString();
                const isSelected = selectedBillIds.includes(billId);
                const isPaid = bill.status === 'PAID' || bill.balanceDue <= 0;
                
                return (
                  <TableRow key={billId} className={isPaid ? 'opacity-50' : ''}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        disabled={isPaid}
                        onChange={(e) => handleBillSelect(billId, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{formatDate(bill.issueDate)}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={billStatusColorMap[bill.status]}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.balanceDue)}</TableCell>
                    <TableCell className="text-right">
                      {isSelected ? (
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          max={bill.balanceDue}
                          value={amounts[billId] || ''}
                          onChange={(e) => handleAmountChange(billId, e.target.value)}
                          className="w-28 text-right"
                        />
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleApplyPayment}
            disabled={isLoadingBills || selectedBillIds.length === 0}
          >
            Apply Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 