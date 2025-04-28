'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductDetail } from '@/components/products/ProductDetail';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { productsClient } from '@/mocks/api-client';
import { IProduct } from '@/mocks/shared-types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;

  useEffect(() => {
    if (!productId) {
      setError('Invalid product ID');
      setIsLoading(false);
      return;
    }

    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, this would call the API
      // const product = await productsClient.getProduct(productId);

      // For demo, use mock data
      setTimeout(() => {
        // Mock product data
        const mockProduct: IProduct = {
          id: productId,
          sku: `PROD-${productId.toString().padStart(5, '0')}`,
          name: `Product ${productId}`,
          description: `This is a detailed description for Product ${productId}. It can include various details about the product such as features, specifications, and usage instructions.`,
          categoryId: 1,
          category: {
            id: 1,
            name: 'Office Supplies',
            description: 'Office supplies and equipment',
          },
          price: 199.99,
          cost: 120.5,
          quantityOnHand: 25,
          reorderPoint: 5,
          isActive: true,
          isSellable: true,
          isPurchasable: true,
          barcode: `BAR${productId.toString().padStart(8, '0')}`,
          weight: 2.5,
          weightUnit: 'kg',
          dimensions: JSON.stringify({ length: 60, width: 60, height: 120, unit: 'cm' }),
          taxable: true,
          taxRateId: 1,
          accountId: 1,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setProduct(mockProduct);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load product. Please try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/products/${productId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      // In a real implementation, this would call the API
      // await productsClient.deleteProduct(productId);

      // For demo, just wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Product deleted',
        description: 'The product has been successfully deleted.',
      });

      // Navigate back to products list
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the product. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
        <p className="text-muted-foreground">{error || 'Product not found'}</p>
        <button
          className="mt-4 underline text-primary"
          onClick={() => router.push('/dashboard/products')}
        >
          Return to Products
        </button>
      </div>
    );
  }

  return (
    <>
      <ProductDetail
        product={product}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{product.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
