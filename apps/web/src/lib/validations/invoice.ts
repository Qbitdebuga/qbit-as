import { z } from 'zod';

/**
 * Line item validation schema
 */
const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: 'Description is required' }),
  quantity: z
    .number()
    .min(0.01, { message: 'Quantity must be greater than 0' })
    .or(z.string().regex(/^\d*\.?\d+$/).transform(Number))
    .refine((val) => val > 0, { message: 'Quantity must be greater than 0' }),
  unitPrice: z
    .number()
    .min(0, { message: 'Unit price must be 0 or greater' })
    .or(z.string().regex(/^\d*\.?\d+$/).transform(Number)),
  taxRate: z
    .number()
    .min(0, { message: 'Tax rate must be 0 or greater' })
    .max(100, { message: 'Tax rate must be 100 or less' })
    .or(z.string().regex(/^\d*\.?\d+$/).transform(Number))
    .optional()
    .nullable(),
  accountId: z.string().min(1, { message: 'Account is required' }),
  amount: z.number().optional(), // This will be calculated
});

/**
 * Invoice validation schema
 */
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required' }),
  customerId: z.string().min(1, { message: 'Customer is required' }),
  issueDate: z
    .string()
    .min(1, { message: 'Issue date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  dueDate: z
    .string()
    .min(1, { message: 'Due date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], {
    message: 'Invalid status',
  }),
  notes: z.string().max(500, { message: 'Notes must be less than 500 characters' }).optional(),
  subtotal: z.number().optional(), // This will be calculated
  taxAmount: z.number().optional(), // This will be calculated
  totalAmount: z.number().optional(), // This will be calculated
  lineItems: z
    .array(lineItemSchema)
    .min(1, { message: 'At least one line item is required' }),
  paymentTerms: z.string().optional(),
  currency: z.string().min(1, { message: 'Currency is required' }).default('USD'),
  accountId: z.string().min(1, { message: 'Account is required' }),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type LineItemFormValues = z.infer<typeof lineItemSchema>;

/**
 * Invoice search/filter form validation
 */
export const invoiceFilterSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', '']).optional(),
  customer: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d{1,2})?$/.test(val), 
      { message: 'Min amount must be a valid number with up to 2 decimal places' }
    ),
  maxAmount: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d{1,2})?$/.test(val), 
      { message: 'Max amount must be a valid number with up to 2 decimal places' }
    ),
});

export type InvoiceFilterValues = z.infer<typeof invoiceFilterSchema>; 