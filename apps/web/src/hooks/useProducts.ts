import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // Mock data for now
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description for product 1',
          price: 19.99,
          sku: 'SKU001',
          category: 'Category A',
          quantity: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description for product 2',
          price: 29.99,
          sku: 'SKU002',
          category: 'Category B',
          quantity: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProducts(mockProducts);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // Mock implementation
      const newProduct: Product = {
        ...product,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProducts((prevProducts) => [...prevProducts, newProduct]);
      return newProduct;
    } catch (err) {
      setError('Failed to add product');
      console.error('Error adding product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, addProduct, refetch: fetchProducts };
}
