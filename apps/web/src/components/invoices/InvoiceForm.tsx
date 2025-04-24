'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { DatePicker } from '../ui/date-picker';
import { useToast } from '../ui/use-toast';
import { formatCurrency } from '@/utils/format';
import { useCustomers } from '@/hooks/useCustomers';
import { CreateInvoiceDto, InvoiceStatus, Invoice } from '@qbit/shared-types';
import { CalendarIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';

// Form schema
const invoiceItemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be at least 0.01'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discountPercentage: z.number().min(0).max(100).optional().nullable(),
  taxPercentage: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional(),
});

const invoiceSchema = z.object({
  customerId: z.string().uuid('Please select a customer'),
  customerReference: z.string().optional(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  isEdit?: boolean;
}

export default function InvoiceForm({ invoice, isEdit = false }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  
  // Calculate payment terms options (Net 15, Net 30, etc.)
  const paymentTermsOptions = [
    { label: 'Due on Receipt', days: 0 },
    { label: 'Net 7', days: 7 },
    { label: 'Net 15', days: 15 },
    { label: 'Net 30', days: 30 },
    { label: 'Net 45', days: 45 },
    { label: 'Net 60', days: 60 },
  ];
  
  // Calculate default values
  const getDefaultValues = (): InvoiceFormValues => {
    if (isEdit && invoice) {
      return {
        customerId: invoice.customerId,
        customerReference: invoice.customerReference || '',
        invoiceDate: new Date(invoice.invoiceDate),
        dueDate: new Date(invoice.dueDate),
        status: invoice.status,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        items: invoice.items?.map(item => ({
          id: item.id,
          itemCode: item.itemCode || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage || null,
          taxPercentage: item.taxPercentage || null,
          notes: item.notes || '',
        })) || [],
      };
    }
    
    return {
      customerId: '',
      customerReference: '',
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to Net 30
      status: InvoiceStatus.DRAFT,
      notes: '',
      terms: 'Thank you for your business.',
      items: [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          discountPercentage: null,
          taxPercentage: null,
        },
      ],
    };
  };
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: getDefaultValues(),
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  // Calculate totals
  const calculateTotals = () => {
    const items = form.getValues('items');
    
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    
    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountPercentage ? lineTotal * (item.discountPercentage / 100) : 0;
      const itemTax = item.taxPercentage ? (lineTotal - itemDiscount) * (item.taxPercentage / 100) : 0;
      
      subtotal += lineTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });
    
    const totalAmount = subtotal - discountAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  };
  
  const totals = calculateTotals();
  
  // Handle payment terms change
  const handlePaymentTermsChange = (days: number) => {
    const invoiceDate = form.getValues('invoiceDate');
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + days);
    form.setValue('dueDate', dueDate);
  };
  
  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    
    try {
      // For now we'll just log the data, but in a real app we'd send it to the API
      console.log(data);
      
      toast({
        title: isEdit ? "Invoice updated" : "Invoice created",
        description: isEdit 
          ? "The invoice has been updated successfully." 
          : "A new invoice has been created successfully.",
      });
      
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: `There was an error ${isEdit ? 'updating' : 'creating'} the invoice. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a new line item
  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: null,
      taxPercentage: null,
    });
  };
  
  // Calculate line total
  const calculateLineTotal = (index: number) => {
    const item = form.getValues(`items.${index}`);
    if (!item) return 0;
    
    const lineTotal = item.quantity * item.unitPrice;
    const discountAmount = item.discountPercentage ? lineTotal * (item.discountPercentage / 100) : 0;
    
    return lineTotal - discountAmount;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
            <CardDescription>
              {isEdit ? 'Update the invoice details' : 'Enter the details for the new invoice'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Selection and References */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingCustomers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCustomers ? (
                          <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                        ) : customers?.length === 0 ? (
                          <SelectItem value="none" disabled>No customers found</SelectItem>
                        ) : (
                          customers?.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The customer you're invoicing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PO-12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      Customer's purchase order or reference number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Dates and Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Invoice Date</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Payment Terms</label>
                <Select
                  onValueChange={(value) => handlePaymentTermsChange(parseInt(value))}
                  defaultValue="30"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((option) => (
                      <SelectItem key={option.days} value={option.days.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  When the invoice is due
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Line Items */}
            <div>
              <h3 className="text-lg font-medium mb-4">Line Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount %</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Item description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.itemCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Item code (optional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0.01"
                                  step="0.01" 
                                  className="text-right"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    // Trigger recalculation
                                    form.trigger();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.01" 
                                  className="text-right"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    // Trigger recalculation
                                    form.trigger();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.discountPercentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01" 
                                  className="text-right"
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                    field.onChange(value);
                                    // Trigger recalculation
                                    form.trigger();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.taxPercentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01" 
                                  className="text-right"
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                    field.onChange(value);
                                    // Trigger recalculation
                                    form.trigger();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(calculateLineTotal(index))}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={addLineItem}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </div>
            
            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.totalAmount)}</span>
                </div>
              </div>
            </div>
            
            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes for the customer"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      These notes will be visible to the customer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and Conditions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Terms and conditions"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Payment terms, delivery terms, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 