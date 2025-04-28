import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { FileEdit, MoreHorizontal, Plus, Trash2, Loader2, SlidersHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { IProductVariant } from '@qbit/shared-types';
import { formatCurrency } from '@/utils/format';
import { productsClient } from '@qbit/api-client';

// Placeholder variants - replace with actual data fetching in a real implementation
const MOCK_VARIANTS: IProductVariant[] = [
  {
    id: 1,
    productId: 1,
    sku: 'PROD-00001-BLK-S',
    name: 'Office Chair - Black, Small',
    attributes: { color: 'Black', size: 'Small' },
    price: 199.99,
    cost: 120.0,
    quantityOnHand: 5,
    reorderPoint: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    productId: 1,
    sku: 'PROD-00001-BLK-M',
    name: 'Office Chair - Black, Medium',
    attributes: { color: 'Black', size: 'Medium' },
    price: 219.99,
    cost: 130.0,
    quantityOnHand: 8,
    reorderPoint: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    productId: 1,
    sku: 'PROD-00001-BLK-L',
    name: 'Office Chair - Black, Large',
    attributes: { color: 'Black', size: 'Large' },
    price: 239.99,
    cost: 140.0,
    quantityOnHand: 3,
    reorderPoint: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Form schema for variant creation/editing
const variantFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  cost: z.number().min(0, 'Cost must be 0 or greater').optional().nullable(),
  quantityOnHand: z.number().min(0, 'Quantity must be 0 or greater').default(0),
  reorderPoint: z.number().min(0, 'Reorder point must be 0 or greater').optional().nullable(),
  attributes: z.string().optional(), // JSON string
  isActive: z.boolean().default(true),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface ProductVariantsProps {
  productId: number;
}

export function ProductVariants({ productId }: ProductVariantsProps) {
  const [variants, setVariants] = useState<IProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      cost: null,
      quantityOnHand: 0,
      reorderPoint: null,
      attributes: '',
      isActive: true,
    },
  });

  // Load variants when component mounts
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setIsLoading(true);
        // In real implementation, replace with actual API call
        // const response = await productsClient.getVariants(productId);
        // setVariants(response);

        // For demo, use mock data
        setTimeout(() => {
          setVariants(MOCK_VARIANTS);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching variants:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product variants',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  const handleAddVariant = () => {
    setSelectedVariant(null);
    form.reset({
      name: '',
      sku: '',
      price: 0,
      cost: null,
      quantityOnHand: 0,
      reorderPoint: null,
      attributes: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditVariant = (variant: IProductVariant) => {
    setSelectedVariant(variant);
    form.reset({
      name: variant.name,
      sku: variant.sku,
      price: Number(variant.price) || 0,
      cost: variant.cost ? Number(variant.cost) : null,
      quantityOnHand: Number(variant.quantityOnHand) || 0,
      reorderPoint: variant.reorderPoint ? Number(variant.reorderPoint) : null,
      attributes: variant.attributes ? JSON.stringify(variant.attributes) : '',
      isActive: variant.isActive,
    });
    setIsEditSheetOpen(true);
  };

  const handleDeleteVariant = (variant: IProductVariant) => {
    setSelectedVariant(variant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVariant) return;

    try {
      // In real implementation, call API to delete variant
      // await productsClient.deleteVariant(selectedVariant.id);

      // For demo, just update local state
      setVariants(variants.filter((v) => v.id !== selectedVariant.id));

      toast({
        title: 'Variant deleted',
        description: `Variant "${selectedVariant.name}" has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete variant',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedVariant(null);
    }
  };

  const onSubmit = async (values: VariantFormValues) => {
    try {
      let attributes = {};
      if (values.attributes) {
        try {
          attributes = JSON.parse(values.attributes);
        } catch (e) {
          form.setError('attributes', {
            type: 'parse',
            message: 'Invalid JSON format',
          });
          return;
        }
      }

      const variantData = {
        ...values,
        productId,
        attributes,
      };

      if (selectedVariant) {
        // Update existing variant
        // In real implementation, call API to update variant
        // await productsClient.updateVariant(selectedVariant.id, variantData);

        // For demo, just update local state
        setVariants(
          variants.map((v) => (v.id === selectedVariant.id ? { ...v, ...variantData } : v)),
        );

        toast({
          title: 'Variant updated',
          description: `Variant "${values.name}" has been updated`,
        });
      } else {
        // Create new variant
        // In real implementation, call API to create variant
        // const response = await productsClient.createVariant(productId, variantData);

        // For demo, just update local state
        const newVariant: IProductVariant = {
          id: Math.max(0, ...variants.map((v) => v.id)) + 1,
          productId,
          sku:
            values.sku ||
            `PROD-${productId.toString().padStart(5, '0')}-VAR-${variants.length + 1}`,
          name: values.name,
          price: values.price || 0,
          cost: values.cost || null,
          quantityOnHand: values.quantityOnHand || 0,
          reorderPoint: values.reorderPoint || null,
          attributes,
          isActive: values.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setVariants([...variants, newVariant]);

        toast({
          title: 'Variant created',
          description: `Variant "${values.name}" has been created`,
        });
      }

      setIsDialogOpen(false);
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error('Error saving variant:', error);
      toast({
        title: 'Error',
        description: 'Failed to save variant',
        variant: 'destructive',
      });
    }
  };

  const renderAttributeBadges = (attributes: Record<string, any> | undefined) => {
    if (!attributes) return null;

    return Object.entries(attributes).map(([key, value]) => (
      <Badge key={key} variant="outline" className="mr-1">
        {key}: {value}
      </Badge>
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Product Variants</h3>
          <p className="text-sm text-muted-foreground">
            {variants.length} variant{variants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleAddVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading variants...</p>
        </div>
      ) : variants.length === 0 ? (
        <div className="border rounded-md flex flex-col items-center justify-center p-8 bg-muted/10">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No variants found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create variants to track different versions of this product
          </p>
          <Button onClick={handleAddVariant}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell>{variant.sku}</TableCell>
                  <TableCell>{renderAttributeBadges(variant.attributes)}</TableCell>
                  <TableCell>{formatCurrency(variant.price)}</TableCell>
                  <TableCell>
                    {variant.quantityOnHand}
                    {variant.quantityOnHand <= (variant.reorderPoint || 0) ? (
                      <Badge variant="destructive" className="ml-2">
                        Low
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.isActive ? 'default' : 'outline'}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditVariant(variant)}>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteVariant(variant)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Variant Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Variant</DialogTitle>
            <DialogDescription>
              Create a new variation of this product with different attributes.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Office Chair - Black, Large" {...field} />
                    </FormControl>
                    <FormDescription>Name that identifies this variant</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Leave blank to auto-generate"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Stock Keeping Unit (unique identifier)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantityOnHand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : null)
                          }
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="attributes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attributes (JSON)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='{"color": "Black", "size": "Large"}'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter attributes as JSON: {`{"color": "Black", "size": "Large"}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save Variant</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Variant Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Variant</SheetTitle>
            <SheetDescription>Update the details for this product variant.</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Office Chair - Black, Large" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input disabled={true} {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>SKU cannot be changed after creation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantityOnHand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            placeholder="5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="attributes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attributes (JSON)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='{"color": "Black", "size": "Large"}'
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter attributes as JSON: {`{"color": "Black", "size": "Large"}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Inactive variants won't appear in catalogs
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="mt-6 space-x-2 flex justify-end">
                  <Button type="submit">Update Variant</Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedVariant && (
            <div className="py-4">
              <p className="font-medium">{selectedVariant.name}</p>
              <p className="text-sm text-muted-foreground">SKU: {selectedVariant.sku}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
