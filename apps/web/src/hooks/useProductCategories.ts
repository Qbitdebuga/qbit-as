'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useApiClient } from './useApiClient';
import { IProductCategory } from '@qbit/shared-types';

export function useProductCategories() {
  const [categories, setCategories] = useState<IProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const apiClient = useApiClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would call the API
      // const response = await apiClient.inventory.products.getCategories();

      // For demo, use mock data
      setTimeout(() => {
        // Mock categories data
        const mockCategories: IProductCategory[] = [
          { id: 1, name: 'Office Supplies', description: 'Office supplies and equipment' },
          { id: 2, name: 'Electronics', description: 'Electronic devices and accessories' },
          { id: 3, name: 'Furniture', description: 'Office furniture and fixtures' },
          { id: 4, name: 'Software', description: 'Software licenses and subscriptions' },
          { id: 5, name: 'Books', description: 'Books and reference materials' },
        ];

        setCategories(mockCategories);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching product categories:', err);
      setError('Failed to load product categories');
      toast({
        title: 'Error',
        description: 'Failed to load product categories. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const createCategory = async (data: Partial<IProductCategory>) => {
    try {
      // In a real implementation, this would call the API
      // const newCategory = await apiClient.inventory.products.createCategory(data);

      // For demo, just add to local state
      const newCategory: IProductCategory = {
        id: Math.max(0, ...categories.map((c) => c.id)) + 1,
        name: data.name || 'New Category',
        description: data.description || '',
      };

      setCategories([...categories, newCategory]);

      toast({
        title: 'Success',
        description: 'Product category created successfully',
      });

      return newCategory;
    } catch (err) {
      console.error('Error creating product category:', err);
      toast({
        title: 'Error',
        description: 'Failed to create product category. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCategory = async (id: number, data: Partial<IProductCategory>) => {
    try {
      // In a real implementation, this would call the API
      // const updatedCategory = await apiClient.inventory.products.updateCategory(id, data);

      // For demo, just update local state
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Category not found');
      }

      const updatedCategory: IProductCategory = {
        ...categories[index],
        ...data,
      };

      const updatedCategories = [...categories];
      updatedCategories[index] = updatedCategory;

      setCategories(updatedCategories);

      toast({
        title: 'Success',
        description: 'Product category updated successfully',
      });

      return updatedCategory;
    } catch (err) {
      console.error('Error updating product category:', err);
      toast({
        title: 'Error',
        description: 'Failed to update product category. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      // In a real implementation, this would call the API
      // await apiClient.inventory.products.deleteCategory(id);

      // For demo, just remove from local state
      setCategories(categories.filter((c) => c.id !== id));

      toast({
        title: 'Success',
        description: 'Product category deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting product category:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product category. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
