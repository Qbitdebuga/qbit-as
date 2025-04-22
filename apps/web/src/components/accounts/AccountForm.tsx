import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Switch
} from '@/components/ui';
import { Account, AccountCreate, AccountType, AccountSubType } from '@qbit/api-client';

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
  isActive: z.boolean().default(true),
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
      type: account?.type || 'ASSET',
      subtype: account?.subtype || 'CASH',
      isActive: account?.isActive ?? true,
      parentId: account?.parentId || '',
    },
  });

  const [selectedType, setSelectedType] = useState<AccountType>(
    account?.type || 'ASSET'
  );

  // Get available subtypes based on the selected account type
  const getAvailableSubtypes = (type: AccountType) => {
    switch (type) {
      case 'ASSET':
        return [
          AccountSubType.CASH,
          AccountSubType.ACCOUNTS_RECEIVABLE,
          AccountSubType.INVENTORY,
          AccountSubType.FIXED_ASSET,
          AccountSubType.OTHER,
        ];
      case 'LIABILITY':
        return [
          AccountSubType.ACCOUNTS_PAYABLE,
          AccountSubType.ACCRUED_LIABILITIES,
          AccountSubType.LONG_TERM_DEBT,
          AccountSubType.OTHER,
        ];
      case 'EQUITY':
        return [
          AccountSubType.COMMON_STOCK,
          AccountSubType.RETAINED_EARNINGS,
          AccountSubType.OTHER,
        ];
      case 'REVENUE':
        return [
          AccountSubType.SALES,
          AccountSubType.OTHER_INCOME,
          AccountSubType.OTHER,
        ];
      case 'EXPENSE':
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
        return [];
    }
  };

  // Format enum values for display
  const formatEnumValue = (value: string) => {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Update subtypes when type changes
  useEffect(() => {
    const currentSubtype = form.getValues('subtype');
    const availableSubtypes = getAvailableSubtypes(selectedType);
    
    // Reset subtype if the current one is not available for selected type
    if (!availableSubtypes.includes(currentSubtype as AccountSubType)) {
      form.setValue('subtype', availableSubtypes[0]);
    }
  }, [selectedType, form]);

  const handleSubmit = (data: AccountFormValues) => {
    onSubmit(data as AccountCreate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
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
            render={({ field }) => (
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
          render={({ field }) => (
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={(value) => {
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Subtype</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-gray-500">
                  Activate or deactivate this account
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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