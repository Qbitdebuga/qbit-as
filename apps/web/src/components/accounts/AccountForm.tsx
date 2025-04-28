'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Button } from '@/components/ui';
import { Switch } from '@/components/ui';

// Define AccountType and AccountSubType directly since there's an import issue
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountSubType {
  CASH = 'CASH',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  FIXED_ASSET = 'FIXED_ASSET',
  ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  ACCRUED_LIABILITIES = 'ACCRUED_LIABILITIES',
  LONG_TERM_DEBT = 'LONG_TERM_DEBT',
  COMMON_STOCK = 'COMMON_STOCK',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  SALES = 'SALES',
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  PAYROLL_EXPENSE = 'PAYROLL_EXPENSE',
  DEPRECIATION_EXPENSE = 'DEPRECIATION_EXPENSE',
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
  OTHER_INCOME = 'OTHER_INCOME',
  TAX_EXPENSE = 'TAX_EXPENSE',
  OTHER = 'OTHER',
}

// Define interfaces directly since imports are not working
export interface Account {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean;
  parentId?: string;
  parent?: Account;
  children?: Account[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountCreate {
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype: AccountSubType;
  isActive?: boolean;
  parentId?: string;
}

// Interface for form field props
interface FieldProps {
  field: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<any>;
  };
}

// Schema for form validation
const accountSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  description: z.string().optional(),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], {
    required_error: 'Please select an account type',
  }),
  subtype: z.string({
    required_error: 'Please select an account subtype',
  }),
  isActive: z.boolean().default(true).optional(),
  parentId: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account;
  parentAccounts?: Account[];
  isSubmitting: boolean;
  onSubmit: (data: AccountCreate) => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  parentAccounts = [],
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: account?.code || '',
      name: account?.name || '',
      description: account?.description || '',
      type: account?.type || AccountType.ASSET,
      subtype: account?.subtype || AccountSubType.CASH,
      isActive: account?.isActive ?? true,
      parentId: account?.parentId || '',
    },
  });

  const [selectedType, setSelectedType] = useState<AccountType>(account?.type || AccountType.ASSET);

  // Get available subtypes based on the selected account type
  const getAvailableSubtypes = (type: AccountType): AccountSubType[] => {
    switch (type) {
      case AccountType.ASSET:
        return [
          AccountSubType.CASH,
          AccountSubType.ACCOUNTS_RECEIVABLE,
          AccountSubType.INVENTORY,
          AccountSubType.FIXED_ASSET,
          AccountSubType.OTHER,
        ];
      case AccountType.LIABILITY:
        return [
          AccountSubType.ACCOUNTS_PAYABLE,
          AccountSubType.ACCRUED_LIABILITIES,
          AccountSubType.LONG_TERM_DEBT,
          AccountSubType.OTHER,
        ];
      case AccountType.EQUITY:
        return [
          AccountSubType.COMMON_STOCK,
          AccountSubType.RETAINED_EARNINGS,
          AccountSubType.OTHER,
        ];
      case AccountType.REVENUE:
        return [AccountSubType.SALES, AccountSubType.OTHER_INCOME, AccountSubType.OTHER];
      case AccountType.EXPENSE:
        return [
          AccountSubType.COST_OF_GOODS_SOLD,
          AccountSubType.OPERATING_EXPENSE,
          AccountSubType.PAYROLL_EXPENSE,
          AccountSubType.DEPRECIATION_EXPENSE,
          AccountSubType.INTEREST_EXPENSE,
          AccountSubType.TAX_EXPENSE,
          AccountSubType.OTHER_EXPENSE,
          AccountSubType.OTHER,
        ];
      default:
        return [AccountSubType.OTHER]; // Default fallback to avoid empty array
    }
  };

  // Format enum values for display
  const formatEnumValue = (value: string): string => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Update subtypes when type changes
  useEffect(() => {
    const currentSubtype = form.getValues('subtype');
    const availableSubtypes = getAvailableSubtypes(selectedType);

    // Reset subtype if the current one is not available for selected type
    if (!currentSubtype || !availableSubtypes.includes(currentSubtype as AccountSubType)) {
      // Use type assertion to convert AccountSubType to string
      form.setValue('subtype', String(availableSubtypes[0]));
    }
  }, [selectedType, form]);

  const handleSubmit: SubmitHandler<AccountFormValues> = (data) => {
    // Convert form data to AccountCreate type
    const accountData: AccountCreate = {
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type as AccountType,
      subtype: data.subtype as AccountSubType,
      isActive: data.isActive ?? true,
      parentId: data.parentId?.length ? data.parentId : undefined,
    };

    onSubmit(accountData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Account Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }: FieldProps) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter account description"
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={(value: string) => {
                    field.onChange(value);
                    setSelectedType(value as AccountType);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AccountType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatEnumValue(type)}
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
            name="subtype"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Account Subtype</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account subtype" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableSubtypes(selectedType).map((subtype) => (
                      <SelectItem key={subtype} value={subtype}>
                        {formatEnumValue(subtype)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {parentAccounts.length > 0 && (
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Parent Account</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent account (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {parentAccounts.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.code} - {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }: FieldProps) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-gray-500">Activate or deactivate this account</div>
              </div>
              <FormControl>
                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};
