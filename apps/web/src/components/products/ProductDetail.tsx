import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  FileEdit, 
  Package, 
  ArrowLeft, 
  Trash2,
  ShoppingCart,
  Tag,
  Truck 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { IProduct } from '@qbit-accounting/shared-types';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/date';
import { ProductVariants } from './ProductVariants';

interface ProductDetailProps {
  product: IProduct;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function ProductDetail({ product, onEdit, onDelete, isLoading = false }: ProductDetailProps) {
  const router = useRouter();
  const [dimensions, setDimensions] = useState<any>(null);

  useEffect(() => {
    // Parse dimensions JSON if present
    if (product.dimensions) {
      try {
        setDimensions(JSON.parse(product.dimensions));
      } catch (error) {
        console.error('Error parsing dimensions:', error);
      }
    }
  }, [product.dimensions]);

  const handleBack = () => {
    router.push('/dashboard/products');
  };

  const stockStatus = () => {
    if (!product.isActive) return { label: 'Inactive', variant: 'outline' as const };
    if (product.quantityOnHand <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (product.quantityOnHand <= (product.reorderPoint || 0)) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const { label, variant } = stockStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            disabled={isLoading}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                  <CardDescription>{product.sku}</CardDescription>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                  <p className="text-xl font-bold">{formatCurrency(product.price)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                  <p className="text-lg">{product.cost ? formatCurrency(product.cost) : '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity in Stock</h3>
                  <p className="text-lg">{product.quantityOnHand}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reorder Point</h3>
                  <p className="text-lg">{product.reorderPoint || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                  <p className="text-lg">{product.barcode || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="text-lg">{product.category?.name || '-'}</p>
                </div>
              </div>

              {product.description && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="variants">
            <TabsList>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="variants" className="p-0 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Different variations of this product (size, color, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductVariants productId={product.id} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transactions" className="p-0 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Transactions</CardTitle>
                  <CardDescription>
                    History of stock movements for this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <p>Transaction history will be available soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Product Options</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={product.isActive ? "default" : "outline"}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant={product.isSellable ? "default" : "outline"}>
                    {product.isSellable ? 'Sellable' : 'Not Sellable'}
                  </Badge>
                  <Badge variant={product.isPurchasable ? "default" : "outline"}>
                    {product.isPurchasable ? 'Purchasable' : 'Not Purchasable'}
                  </Badge>
                  <Badge variant={product.taxable ? "default" : "outline"}>
                    {product.taxable ? 'Taxable' : 'Not Taxable'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {(product.weight || dimensions) && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Information</h3>
                    
                    {product.weight && (
                      <div className="flex items-center py-1">
                        <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Weight: {product.weight} {product.weightUnit || 'kg'}</span>
                      </div>
                    )}
                    
                    {dimensions && (
                      <div className="flex items-center py-1">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Dimensions: {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensions.unit || 'cm'}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                </>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">System Information</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{formatDate(product.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{product.id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6 pb-2">
              {product.imageUrl && (
                <div className="w-full">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="max-w-full h-auto rounded-md border"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">Product Image</p>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Quick Actions
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
              <Button className="w-full" variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 