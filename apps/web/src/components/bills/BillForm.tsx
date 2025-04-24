'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BillsApiClient, VendorsApiClient } from '@qbit-accounting/api-client';
import { Bill, BillStatus, CreateBillDto, Vendor } from '@qbit-accounting/shared-types';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format, addDays } from 'date-fns';

const billsApiClient = new BillsApiClient();
const vendorsApiClient = new VendorsApiClient();

// Define the form schema for validation
const lineItemSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be positive' }),
  unitPrice: z.coerce.number().nonnegative({ message: 'Unit price cannot be negative' }),
  amount: z.coerce.number().nonnegative().optional(),
  accountId: z.string().optional(),
  accountCode: z.string().optional(),
  taxRate: z.coerce.number().nonnegative().optional(),
  taxAmount: z.coerce.number().nonnegative().optional(),
});

const formSchema = z.object({
  vendorId: z.string({ required_error: 'Vendor is required' }),
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required' }),
  issueDate: z.date({ required_error: 'Issue date is required' }),
  dueDate: z.date({ required_error: 'Due date is required' }),
  status: z.nativeEnum(BillStatus).default(BillStatus.DRAFT),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, { message: 'At least one line item is required' }),
});

type FormValues = z.infer<typeof formSchema>;

interface BillFormProps {
  billId?: string;
  initialData?: Bill;
  onSave: (data: CreateBillDto) => void;
}

export default function BillForm({ billId, initialData, onSave }: BillFormProps) {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<FormValues> = {
    vendorId: initialData?.vendorId?.toString() || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    issueDate: initialData?.issueDate ? new Date(initialData.issueDate) : new Date(),
    dueDate: initialData?.dueDate 
      ? new Date(initialData.dueDate) 
      : addDays(new Date(), 30), // Default to 30 day terms
    status: (initialData?.status as BillStatus) || BillStatus.DRAFT,
    notes: initialData?.notes || '',
    lineItems: initialData?.lineItems?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
      accountId: item.accountId?.toString(),
      accountCode: item.accountCode,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
    })) || [{ description: '', quantity: 1, unitPrice: 0 }],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  useEffect(() => {
    if (token) {
      vendorsApiClient.setAuthToken(token);
      billsApiClient.setAuthToken(token);
      fetchVendors();
    }
  }, [token]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await vendorsApiClient.getVendors();
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Failed to load vendors',
        description: 'There was an error loading the vendor list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to calculate line item amount from quantity and unit price
  const calculateLineItemAmount = (index: number) => {
    const quantity = form.getValues(`lineItems.${index}.quantity`);
    const unitPrice = form.getValues(`lineItems.${index}.unitPrice`);
    
    if (quantity && unitPrice) {
      const amount = quantity * unitPrice;
      form.setValue(`lineItems.${index}.amount`, amount);
      
      // Calculate tax amount if tax rate is present
      const taxRate = form.getValues(`lineItems.${index}.taxRate`);
      if (taxRate) {
        const taxAmount = amount * (taxRate / 100);
        form.setValue(`lineItems.${index}.taxAmount`, taxAmount);
      }
    }
  };

  // Function to calculate totals
  const calculateTotals = () => {
    const lineItems = form.getValues('lineItems');
    
    const subtotal = lineItems.reduce((sum, item) => {
      const amount = item.amount || (item.quantity * item.unitPrice);
      return sum + amount;
    }, 0);
    
    const taxTotal = lineItems.reduce((sum, item) => {
      return sum + (item.taxAmount || 0);
    }, 0);
    
    const total = subtotal + taxTotal;
    
    return { subtotal, taxTotal, total };
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Calculate amounts for each line item
      data.lineItems.forEach((item, index) => {
        if (!item.amount) {
          calculateLineItemAmount(index);
        }
      });

      // Calculate totals
      const { subtotal, taxTotal, total } = calculateTotals();
      
      // Create the submission data
      const submissionData: CreateBillDto = {
        ...data,
        issueDate: format(data.issueDate, 'yyyy-MM-dd'),
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        subtotal,
        taxAmount: taxTotal,
        totalAmount: total,
      };
      
      if (billId) {
        // If billId exists, it's an update
        await billsApiClient.updateBill(billId, submissionData);
        toast({
          title: 'Bill Updated',
          description: 'The bill has been updated successfully.',
        });
      } else {
        // Otherwise, it's a new bill
        await billsApiClient.createBill(submissionData);
        toast({
          title: 'Bill Created',
          description: 'The bill has been created successfully.',
        });
      }
      
      onSave(submissionData);
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: 'Error Saving Bill',
        description: 'There was an error saving the bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Invoice #" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Line Items</h3>
          
          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Tax Rate (%)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.accountCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Account code (optional)" 
                                {...field} 
                                className="mt-2 text-sm" 
                                value={field.value || ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0.01" 
                                step="0.01" 
                                placeholder="Qty" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateLineItemAmount(index);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                placeholder="Price" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateLineItemAmount(index);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                placeholder="0%" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateLineItemAmount(index);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                readOnly 
                                value={
                                  field.value !== undefined 
                                    ? field.value 
                                    : ((form.getValues(`lineItems.${index}.quantity`) || 0) * 
                                       (form.getValues(`lineItems.${index}.unitPrice`) || 0)).toFixed(2)
                                } 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Line Item
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any additional notes or comments"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be visible on the bill for internal reference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : billId ? 'Update Bill' : 'Create Bill'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 