'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LineItems from './LineItems';
import { InvoiceStatus } from '@qbit/shared-types';
import { invoicesClient } from '@/utils/api-clients';
import { setupAuthForClient } from '@/utils/auth-helpers';

// Simple type for the form state
interface InvoiceFormData {
  id?: string | number;
  customerId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  notes: string;
  lineItems: {
    id: string | number;
    description: string;
    quantity: number;
    unitPrice: number;
    productId: string | number;
  }[];
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  isEditing?: boolean;
}

export default function InvoiceForm({ initialData, isEditing = false }: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultInvoiceData: InvoiceFormData = {
    customerId: '',
    invoiceNumber: '',
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default: 30 days from now
    status: InvoiceStatus.DRAFT,
    notes: '',
    lineItems: [
      { id: '', description: '', quantity: 1, unitPrice: 0, productId: '' }
    ]
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    ...defaultInvoiceData,
    ...initialData
  });

  // Initialize auth for clients
  useEffect(() => {
    setupAuthForClient(invoicesClient);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setInvoiceData({ ...invoiceData, status: value as InvoiceStatus });
  };

  const handleDateChange = (field: 'issueDate' | 'dueDate', event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : undefined;
    if (date) {
      setInvoiceData({ ...invoiceData, [field]: date });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditing && invoiceData.id) {
        // Update existing invoice
        await invoicesClient.updateInvoice(invoiceData.id.toString(), {
          customerId: invoiceData.customerId,
          invoiceNumber: invoiceData.invoiceNumber,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          status: invoiceData.status,
          notes: invoiceData.notes,
          lineItems: invoiceData.lineItems
        });
      } else {
        // Create new invoice
        await invoicesClient.createInvoice({
          customerId: invoiceData.customerId,
          invoiceNumber: invoiceData.invoiceNumber,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          status: invoiceData.status,
          notes: invoiceData.notes,
          lineItems: invoiceData.lineItems
        });
      }
      
      // Redirect to invoices list
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the subtotal of all line items
  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  // Create a compatible line items setter function
  const handleLineItemsChange = (newLineItems: any) => {
    setInvoiceData({ ...invoiceData, lineItems: newLineItems });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                name="customerId"
                value={invoiceData.customerId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <DatePicker
                value={invoiceData.issueDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('issueDate', e)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
                value={invoiceData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('dueDate', e)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={invoiceData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Items */}
          <LineItems
            lineItems={invoiceData.lineItems}
            setLineItems={handleLineItemsChange}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={invoiceData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard/invoices')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 