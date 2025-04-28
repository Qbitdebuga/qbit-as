'use client';

import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRightLeft,
  Trash2,
  Plus,
  Package,
  Loader2,
  CheckCircle,
  ArrowLeft,
  CalendarIcon,
} from 'lucide-react';
import {
  IInventoryTransaction,
  IProduct,
  IProductVariant,
  IWarehouse,
  IWarehouseLocation,
  ITransactionLine,
} from '@qbit/shared-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const transactionTypes = [
  { value: 'receipt', label: 'Receive Inventory' },
  { value: 'shipment', label: 'Ship Inventory' },
  { value: 'transfer', label: 'Transfer Between Warehouses' },
  { value: 'adjustment', label: 'Inventory Adjustment' },
  { value: 'count', label: 'Inventory Count' },
];

// Define the transaction schema
const transactionSchema = z.object({
  transactionType: z.string().min(1, { message: 'Transaction type is required' }),
  referenceNumber: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  sourceWarehouseId: z.string().optional(),
  targetWarehouseId: z.string().min(1, { message: 'Target warehouse is required' }),
  transactionDate: z.date({ required_error: 'Transaction date is required' }),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.number().optional(),
        variantId: z.number().optional(),
        sourceLocationId: z.number().optional(),
        targetLocationId: z.number().optional(),
        expectedQuantity: z.number().min(0.01, { message: 'Quantity must be greater than 0' }),
        lotNumber: z.string().optional(),
        serialNumber: z.string().optional(),
        expirationDate: z.date().optional(),
        unitCost: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1, { message: 'At least one item is required' }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: IInventoryTransaction;
  products: IProduct[];
  variants: Map<number, IProductVariant[]>;
  warehouses: IWarehouse[];
  locations: Map<string, IWarehouseLocation[]>;
  isLoading?: boolean;
  onSave: (data: TransactionFormValues) => void;
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  products,
  variants,
  warehouses,
  locations,
  isLoading = false,
  onSave,
  onCancel,
}: TransactionFormProps) {
  const [selectedTransactionType, setSelectedTransactionType] = useState(
    transaction?.transactionType || 'receipt',
  );

  // Initialize form with default values or existing transaction
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          transactionType: transaction.transactionType,
          referenceNumber: transaction.referenceNumber || '',
          referenceType: transaction.referenceType || '',
          referenceId: transaction.referenceId || '',
          sourceWarehouseId: transaction.sourceWarehouseId || '',
          targetWarehouseId: transaction.targetWarehouseId || '',
          transactionDate: new Date(transaction.transactionDate),
          notes: transaction.notes || '',
          lines:
            transaction.lines?.map((line) => ({
              id: line.id,
              productId: line.productId || undefined,
              variantId: line.variantId || undefined,
              sourceLocationId: line.sourceLocationId || undefined,
              targetLocationId: line.targetLocationId || undefined,
              expectedQuantity: Number(line.expectedQuantity),
              lotNumber: line.lotNumber || '',
              serialNumber: line.serialNumber || '',
              expirationDate: line.expirationDate ? new Date(line.expirationDate) : undefined,
              unitCost: line.unitCost ? Number(line.unitCost) : undefined,
              notes: line.notes || '',
            })) || [],
        }
      : {
          transactionType: 'receipt',
          referenceNumber: '',
          referenceType: '',
          referenceId: '',
          sourceWarehouseId: '',
          targetWarehouseId: '',
          transactionDate: new Date(),
          notes: '',
          lines: [
            {
              productId: undefined,
              variantId: undefined,
              sourceLocationId: undefined,
              targetLocationId: undefined,
              expectedQuantity: 1,
              lotNumber: '',
              serialNumber: '',
              expirationDate: undefined,
              unitCost: undefined,
              notes: '',
            },
          ],
        },
  });

  // Update form when transaction type changes
  useEffect(() => {
    if (selectedTransactionType !== form.getValues().transactionType) {
      form.setValue('transactionType', selectedTransactionType);

      // Adjust warehouse requirements based on transaction type
      if (selectedTransactionType === 'transfer') {
        form.clearErrors('sourceWarehouseId');
      } else if (selectedTransactionType === 'adjustment' || selectedTransactionType === 'count') {
        form.clearErrors('sourceWarehouseId');
      }
    }
  }, [selectedTransactionType, form]);

  // Add a new line item
  const addLineItem = () => {
    const currentLines = form.getValues().lines || [];
    form.setValue('lines', [
      ...currentLines,
      {
        productId: undefined,
        variantId: undefined,
        sourceLocationId: undefined,
        targetLocationId: undefined,
        expectedQuantity: 1,
        lotNumber: '',
        serialNumber: '',
        expirationDate: undefined,
        unitCost: undefined,
        notes: '',
      },
    ]);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const currentLines = form.getValues().lines || [];
    if (currentLines.length > 1) {
      form.setValue(
        'lines',
        currentLines.filter((_, i) => i !== index),
      );
    }
  };

  // Handle form submission
  const onSubmit = (data: TransactionFormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {transaction ? 'Edit Inventory Transaction' : 'New Inventory Transaction'}
            </CardTitle>
            <CardDescription>
              {transaction
                ? 'Update this inventory transaction'
                : 'Create a new inventory movement, transfer, or adjustment'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedTransactionType(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedTransactionType === 'receipt' &&
                      'Receive inventory into the warehouse'}
                    {selectedTransactionType === 'shipment' &&
                      'Ship inventory out from the warehouse'}
                    {selectedTransactionType === 'transfer' &&
                      'Move inventory between warehouses or locations'}
                    {selectedTransactionType === 'adjustment' &&
                      'Adjust inventory levels (write-off, correction)'}
                    {selectedTransactionType === 'count' &&
                      'Set inventory levels based on physical count'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Number */}
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PO-12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      Order or document number (e.g., purchase order, sales order)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Date */}
              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When this transaction occurred</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Warehouse - For transfers */}
              {selectedTransactionType === 'transfer' && (
                <FormField
                  control={form.control}
                  name="sourceWarehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Warehouse to transfer items from</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Target Warehouse */}
              <FormField
                control={form.control}
                name="targetWarehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedTransactionType === 'transfer' ? 'Target Warehouse' : 'Warehouse'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedTransactionType === 'transfer'
                        ? 'Warehouse to transfer items to'
                        : 'Warehouse for this transaction'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about this transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Line Items */}
            <div>
              <h3 className="text-lg font-medium mb-4">Transaction Items</h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      {selectedTransactionType === 'transfer' && (
                        <>
                          <TableHead>Source Location</TableHead>
                          <TableHead>Target Location</TableHead>
                        </>
                      )}
                      {selectedTransactionType !== 'transfer' && <TableHead>Location</TableHead>}
                      <TableHead>Quantity</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.getValues().lines?.map((line, index) => (
                      <TableRow key={index}>
                        {/* Product */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.productId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <Select
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Variant */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.variantId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <Select
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={field.value?.toString()}
                                  disabled={!form.getValues().lines[index].productId}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {form.getValues().lines[index].productId &&
                                      variants.has(
                                        form.getValues().lines[index].productId as number,
                                      ) &&
                                      variants
                                        .get(form.getValues().lines[index].productId as number)
                                        ?.map((variant) => (
                                          <SelectItem
                                            key={variant.id}
                                            value={variant.id.toString()}
                                          >
                                            {variant.name}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Source Location - For transfers */}
                        {selectedTransactionType === 'transfer' && (
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.sourceLocationId`}
                              render={({ field }) => (
                                <FormItem className="space-y-0 mb-0">
                                  <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value?.toString()}
                                    disabled={!form.getValues().sourceWarehouseId}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {form.getValues().sourceWarehouseId &&
                                        locations.has(form.getValues().sourceWarehouseId) &&
                                        locations
                                          .get(form.getValues().sourceWarehouseId)
                                          ?.map((location) => (
                                            <SelectItem
                                              key={location.id}
                                              value={location.id.toString()}
                                            >
                                              {location.name}
                                            </SelectItem>
                                          ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        )}

                        {/* Target Location */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.targetLocationId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <Select
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={field.value?.toString()}
                                  disabled={!form.getValues().targetWarehouseId}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {form.getValues().targetWarehouseId &&
                                      locations.has(form.getValues().targetWarehouseId) &&
                                      locations
                                        .get(form.getValues().targetWarehouseId)
                                        ?.map((location) => (
                                          <SelectItem
                                            key={location.id}
                                            value={location.id.toString()}
                                          >
                                            {location.name}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Quantity */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.expectedQuantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="w-24"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Remove Line */}
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            disabled={form.getValues().lines.length <= 1}
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
                className="mt-4"
                onClick={addLineItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
