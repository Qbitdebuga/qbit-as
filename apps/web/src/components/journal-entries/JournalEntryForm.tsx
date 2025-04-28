'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Button,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui';
import { Account, JournalEntry, JournalEntryCreate } from '@qbit/shared-types';
import { PlusCircle, Trash2, Calculator } from 'lucide-react';

// Schema for form validation
const journalEntryLineSchema = z
  .object({
    accountId: z.string().min(1, 'Account is required'),
    description: z.string().optional(),
    debit: z.union([
      z.number().min(0, 'Debit must be a positive number or zero'),
      z.string().transform((val, ctx) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
          ctx.addIssue({ code: 'custom', message: 'Invalid number' });
          return z.NEVER;
        }
        return parsed;
      }),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ]),
    credit: z.union([
      z.number().min(0, 'Credit must be a positive number or zero'),
      z.string().transform((val, ctx) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
          ctx.addIssue({ code: 'custom', message: 'Invalid number' });
          return z.NEVER;
        }
        return parsed;
      }),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ]),
  })
  .refine(
    (data) => {
      // Either debit or credit should be set, but not both
      return (
        (data.debit !== undefined && data.credit === undefined) ||
        (data.credit !== undefined && data.debit === undefined)
      );
    },
    {
      message: 'Either debit or credit must be set, but not both',
      path: ['debit'],
    },
  );

const journalEntrySchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    reference: z.string().optional(),
    isAdjustment: z.boolean().default(false),
    lines: z.array(journalEntryLineSchema).min(2, 'At least two lines are required'),
  })
  .refine(
    (data) => {
      // Calculate total debits and credits
      let totalDebits = 0;
      let totalCredits = 0;

      data.lines.forEach((line) => {
        if (line.debit) totalDebits += parseFloat(line.debit.toString());
        if (line.credit) totalCredits += parseFloat(line.credit.toString());
      });

      // Allow for small rounding errors
      return Math.abs(totalDebits - totalCredits) < 0.01;
    },
    {
      message: 'Total debits must equal total credits',
      path: ['lines'],
    },
  );

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
  entry?: JournalEntry;
  accounts: Account[];
  isSubmitting: boolean;
  onSubmit: (data: JournalEntryCreate) => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  entry,
  accounts,
  isSubmitting,
  onSubmit,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Initialize form with default values or existing entry values
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: entry?.date ? entry.date.split('T')[0] : today,
      description: entry?.description || '',
      reference: entry?.reference || '',
      isAdjustment: entry?.isAdjustment || false,
      lines: entry?.lines?.map((line) => ({
        accountId: line.accountId,
        description: line.description || '',
        debit: line.debit,
        credit: line.credit,
      })) || [
        { accountId: '', description: '', debit: undefined, credit: undefined },
        { accountId: '', description: '', debit: undefined, credit: undefined },
      ],
    },
  });

  // Use field array for dynamic line items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  const [totals, setTotals] = useState({ debits: 0, credits: 0 });

  // Calculate totals whenever form values change
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('lines')) {
        // Only recalculate when lines change
        const values = form.getValues();
        let totalDebits = 0;
        let totalCredits = 0;

        values.lines?.forEach((line) => {
          if (line.debit) totalDebits += parseFloat(line.debit.toString());
          if (line.credit) totalCredits += parseFloat(line.credit.toString());
        });

        setTotals({ debits: totalDebits, credits: totalCredits });
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  // Format amount for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Add a new empty line
  const addLine = () => {
    append({ accountId: '', description: '', debit: undefined, credit: undefined });
  };

  // Handle form submission
  const handleSubmit = (data: JournalEntryFormValues) => {
    onSubmit(data as JournalEntryCreate);
  };

  // Sort accounts by code for better display
  const sortedAccounts = [...accounts].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Invoice #, Check #, etc."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdjustment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Adjustment Entry</FormLabel>
                    <div className="text-sm text-gray-500">Mark as an adjustment entry</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description for this journal entry"
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Journal Entry Lines</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="mb-4 p-4 border rounded-md relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.accountId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sortedAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
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
                    name={`lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line Description (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Line description"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`lines.${index}.debit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Debit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                form.setValue(`lines.${index}.credit`, undefined);
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`lines.${index}.credit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                form.setValue(`lines.${index}.debit`, undefined);
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {form.formState.errors.lines && !Array.isArray(form.formState.errors.lines) && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {form.formState.errors.lines.message}
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Journal Entry Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Debits</p>
                  <p className="text-lg font-medium">{formatCurrency(totals.debits)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Credits</p>
                  <p className="text-lg font-medium">{formatCurrency(totals.credits)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Difference</p>
                <p
                  className={`text-lg font-medium ${Math.abs(totals.debits - totals.credits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(Math.abs(totals.debits - totals.credits))}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                {Math.abs(totals.debits - totals.credits) < 0.01
                  ? 'Journal entry is balanced'
                  : 'Journal entry must be balanced (debits = credits)'}
              </p>
            </CardFooter>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : entry ? 'Update Journal Entry' : 'Create Journal Entry'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
