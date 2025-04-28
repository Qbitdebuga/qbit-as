import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { IProduct, IProductCategory } from '@qbit/shared-types';
import { ProductVariants } from './ProductVariants';
import { useProductCategories } from '@/hooks/useProductCategories';

// Form validation schema
const productSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  categoryId: z.number().optional().nullable(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  cost: z.number().min(0, 'Cost must be 0 or greater').optional().nullable(),
  quantityOnHand: z.number().min(0, 'Quantity must be 0 or greater').default(0),
  reorderPoint: z.number().min(0, 'Reorder point must be 0 or greater').optional().nullable(),
  isActive: z.boolean().default(true),
  isSellable: z.boolean().default(true),
  isPurchasable: z.boolean().default(true),
  barcode: z.string().optional(),
  weight: z.number().min(0, 'Weight must be 0 or greater').optional().nullable(),
  weightUnit: z.string().optional(),
  dimensions: z.string().optional(),
  taxable: z.boolean().default(true),
  taxRateId: z.number().optional().nullable(),
  accountId: z.number().optional().nullable(),
  imageUrl: z.string().url('Invalid URL').optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: IProduct;
  onSubmit: (data: Partial<IProduct>) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading = false }: ProductFormProps) {
  const { categories, isLoading: isCategoriesLoading } = useProductCategories();

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          // Convert string numbers to actual numbers
          price: Number(initialData.price),
          cost: initialData.cost ? Number(initialData.cost) : null,
          quantityOnHand: Number(initialData.quantityOnHand),
          reorderPoint: initialData.reorderPoint ? Number(initialData.reorderPoint) : null,
          weight: initialData.weight ? Number(initialData.weight) : null,
        }
      : {
          name: '',
          description: '',
          price: 0,
          cost: null,
          quantityOnHand: 0,
          reorderPoint: null,
          isActive: true,
          isSellable: true,
          isPurchasable: true,
          taxable: true,
          weightUnit: 'kg',
        },
  });

  // Handle form submission
  const handleSubmit = async (values: ProductFormValues) => {
    try {
      // Format values before submitting
      const formattedValues = {
        ...values,
        // Convert empty strings to null
        categoryId: values.categoryId || null,
        cost: values.cost || null,
        reorderPoint: values.reorderPoint || null,
        weight: values.weight || null,
        taxRateId: values.taxRateId || null,
        accountId: values.accountId || null,
        imageUrl: values.imageUrl || null,
      };

      await onSubmit(formattedValues);
      if (!initialData) {
        form.reset(); // Reset form after successful creation
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the product.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Enter the basic information about the product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SKU - Only editable if creating a new product */}
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          disabled={!!initialData}
                          placeholder="Leave blank for auto-generation"
                        />
                      </FormControl>
                      <FormDescription>
                        {initialData
                          ? 'SKU cannot be changed after creation'
                          : 'Leave blank to auto-generate'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Office Chair" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={isCategoriesLoading}
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cost */}
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Initial Stock */}
                <FormField
                  control={form.control}
                  name="quantityOnHand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity in Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reorder Point */}
                <FormField
                  control={form.control}
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : null)
                          }
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        When stock falls below this level, the product will be marked for reordering
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Barcode */}
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'kg'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                            <SelectItem value="oz">Ounces (oz)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dimensions */}
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='{"length": 60, "width": 60, "height": 120, "unit": "cm"}'
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter as JSON: {`{"length": 60, "width": 60, "height": 120, "unit": "cm"}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/images/product.jpg"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the product"
                        className="min-h-32"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Is Active */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Inactive products won't appear in catalogs
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Is Sellable */}
                <FormField
                  control={form.control}
                  name="isSellable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sellable</FormLabel>
                        <FormDescription>Can this product be sold to customers?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Is Purchasable */}
                <FormField
                  control={form.control}
                  name="isPurchasable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Purchasable</FormLabel>
                        <FormDescription>
                          Can this product be purchased from vendors?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Is Taxable */}
                <FormField
                  control={form.control}
                  name="taxable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Taxable</FormLabel>
                        <FormDescription>Is this product subject to sales tax?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
              </Button>
            </CardFooter>
          </Card>

          {/* Product Variants section - only show if editing an existing product */}
          {initialData && (
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Manage variations of this product (different sizes, colors, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductVariants productId={initialData.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </Form>
  );
}
