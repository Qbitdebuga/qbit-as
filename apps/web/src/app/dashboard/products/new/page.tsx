'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { productsClient } from '@/mocks/api-client';
import { IProduct } from '@/mocks/shared-types';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<IProduct>) => {
    try {
      setIsSubmitting(true);

      // In a real implementation, this would call the API
      // const newProduct = await productsClient.createProduct(data);

      // For demo, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Product created',
        description: 'New product has been successfully created',
      });

      // Navigate to products list or to the new product detail page
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={handleCancel} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
            <p className="text-muted-foreground">Create a new product in your inventory.</p>
          </div>
        </div>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
