'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { billsClient, vendorsClient } from '@qbit-accounting/api-client';
import { useAuth } from '@/hooks/useAuth';
import { setupAuthForClient } from '@/utils/auth-helpers';

// Import the types from shared-types
import { 
  Vendor, 
  BillStatus
} from '@qbit-accounting/shared-types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LineItems from './LineItems';

// Type for line items in the form
interface FormBillLineItem {
  id: string | number; 
  description: string;
  quantity: number;
  unitPrice: number;
  accountId: string | number;
}

// Types for the form data
interface FormData {
  vendorId: string;
  billNumber: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  status?: string;
  invoiceNumber?: string;
}

// Type for the form props
interface BillFormProps {
  billId?: string;
  onSuccess?: () => void;
}

export default function BillForm({ billId, onSuccess }: BillFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [lineItems, setLineItems] = useState<FormBillLineItem[]>([
    { id: '', description: '', quantity: 1, unitPrice: 0, accountId: '' }
  ]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>();

  const issueDate = watch('issueDate');
  const dueDate = watch('dueDate');
  const vendorId = watch('vendorId');

  useEffect(() => {
    if (isAuthenticated) {
      setupAuthForClient(billsClient);
      setupAuthForClient(vendorsClient);
      
      // Fetch vendors
      fetchVendors();
      
      // If editing, fetch bill details
      if (billId) {
        fetchBill();
      }
    }
  }, [isAuthenticated, billId]);

  const fetchVendors = async () => {
    try {
      const result = await vendorsClient.getVendors();
      // Handle different response formats
      const vendorsData = Array.isArray(result) ? result : result.data || [];
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again later.');
    }
  };

  const fetchBill = async () => {
    if (!billId) return;
    
    try {
      setLoading(true);
      const bill = await billsClient.getBillById(billId);
      
      if (bill) {
        // Populate form with bill data
        reset({
          vendorId: String(bill.vendorId), // Convert to string for form
          billNumber: bill.billNumber,
          invoiceNumber: bill.invoiceNumber || '',
          issueDate: bill.issueDate ? new Date(bill.issueDate) : undefined,
          dueDate: bill.dueDate ? new Date(bill.dueDate) : undefined,
          notes: bill.notes || '',
          status: bill.status
        });
        
        // Set line items if available
        if (bill.lineItems && bill.lineItems.length > 0) {
          // Convert any number IDs to strings for the form
          setLineItems(bill.lineItems.map(item => ({
            id: item.id !== undefined ? String(item.id) : '',
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            accountId: item.accountId !== undefined ? String(item.accountId) : ''
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching bill:', err);
      setError('Failed to load bill details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format line items for API by converting string IDs to numbers where needed
      const formattedLineItems = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
        accountId: typeof item.accountId === 'string' && item.accountId.trim() !== '' ? 
          parseInt(item.accountId) : typeof item.accountId === 'number' ? item.accountId : undefined
      }));
      
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // Prepare data for API with proper date formats
      const billData = {
        vendorId: data.vendorId,
        billNumber: data.billNumber,
        invoiceNumber: data.invoiceNumber || data.billNumber,
        issueDate: data.issueDate ? data.issueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: data.notes,
        status: data.status as BillStatus,
        subtotal,
        totalAmount: subtotal,
        taxAmount: 0,
        lineItems: formattedLineItems.map(item => ({
          ...item,
          amount: item.lineTotal // Add amount field required by BillLineItem
        }))
      };
      
      let response;
      
      if (billId) {
        // Update existing bill - use type assertion to bypass type checking
        response = await billsClient.updateBill(billId, billData as any);
      } else {
        // Create new bill - use type assertion to bypass type checking
        response = await billsClient.createBill(billData as any);
      }
      
      if (response) {
        if (onSuccess) {
          onSuccess();
        } else {
          // Navigate to the bill detail page or bills list
          const newBillId = billId || (response.id ? String(response.id) : undefined);
          if (newBillId) {
            router.push(`/dashboard/bills/${newBillId}`);
          } else {
            router.push('/dashboard/bills');
          }
        }
      } else {
        setError('Failed to save bill. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setError(err.message || 'An error occurred while saving the bill.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'issueDate' | 'dueDate', e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setValue(field, date);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vendorId">Vendor</Label>
          <Select
            onValueChange={(value) => setValue('vendorId', value)}
            value={vendorId || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={String(vendor.id)} value={String(vendor.id)}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vendorId && (
            <p className="text-red-500 text-sm">{errors.vendorId.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="billNumber">Bill Number</Label>
          <Input
            id="billNumber"
            placeholder="Enter bill number"
            {...register('billNumber', { required: 'Bill number is required' })}
          />
          {errors.billNumber && (
            <p className="text-red-500 text-sm">{errors.billNumber.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date</Label>
          <DatePicker
            value={issueDate ? issueDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('issueDate', e)}
          />
          {errors.issueDate && (
            <p className="text-red-500 text-sm">{errors.issueDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <DatePicker
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('dueDate', e)}
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter any notes about this bill"
          {...register('notes')}
        />
      </div>
      
      <LineItems 
        lineItems={lineItems} 
        setLineItems={setLineItems} 
      />
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : billId ? 'Update Bill' : 'Create Bill'}
        </Button>
      </div>
    </form>
  );
}