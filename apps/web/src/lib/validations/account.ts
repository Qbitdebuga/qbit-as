import { z } from 'zod';

/**
 * Account form validation schema
 */
export const accountSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Account name must be at least 2 characters' })
    .max(100, { message: 'Account name must be less than 100 characters' }),
  number: z
    .string()
    .min(1, { message: 'Account number is required' })
    .max(50, { message: 'Account number must be less than 50 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], {
    message: 'Invalid account type',
  }),
  subtype: z.string().optional(),
  isActive: z.boolean().default(true),
  parentAccountId: z.string().nullable().optional(),
  // Balance should be a valid number with up to 2 decimal places
  balance: z
    .string()
    .optional()
    .refine((val) => !val || /^-?\d+(\.\d{1,2})?$/.test(val), {
      message: 'Balance must be a valid number with up to 2 decimal places',
    })
    .transform((val) => (val ? parseFloat(val) : 0)),
  // Tax rate should be a valid percentage (0-100)
  taxRate: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (/^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) >= 0 && parseFloat(val) <= 100),
      { message: 'Tax rate must be a valid percentage between 0 and 100' },
    )
    .transform((val) => (val ? parseFloat(val) : null)),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

/**
 * Account search/filter form validation
 */
export const accountFilterSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', '']).optional(),
  status: z.enum(['active', 'inactive', '']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type AccountFilterValues = z.infer<typeof accountFilterSchema>;
