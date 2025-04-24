'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { productsClient } from '@qbit-accounting/api-client';
import { IProduct } from '@qbit-accounting/shared-types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          category: { id: 1, name: 'Office Supplies', description: 'Office supplies and equipment' },
          price: 199.99,
          cost: 120.50,
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

  const handleSubmit = async (data: Partial<IProduct>) => {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would call the API
      // const updatedProduct = await productsClient.updateProduct(productId, data);
      
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Product updated',
        description: 'Product has been successfully updated',
      });
      
      // Navigate back to product detail page
      router.push(`/dashboard/products/${productId}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push(`/dashboard/products/${productId}`);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product information for {product.name}
            </p>
          </div>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
} 