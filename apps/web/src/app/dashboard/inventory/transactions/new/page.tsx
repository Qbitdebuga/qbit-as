'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { useToast } from '@/components/ui/use-toast';
import { TransactionForm } from '@/components/inventory/TransactionForm';
import { useRouter } from 'next/navigation';
import { inventoryClient, productsClient } from '@qbit-accounting/api-client';
import { IProduct, IProductVariant, IWarehouse, IWarehouseLocation } from '@qbit-accounting/shared-types';

export default function NewTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [variants, setVariants] = useState<Map<number, IProductVariant[]>>(new Map());
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
  const [locations, setLocations] = useState<Map<string, IWarehouseLocation[]>>(new Map());

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsResponse = await productsClient.getProducts({ limit: 1000 });
        setProducts(productsResponse.data);

        // Fetch variants for each product
        const variantsMap = new Map<number, IProductVariant[]>();
        for (const product of productsResponse.data) {
          try {
            const productVariants = await productsClient.getVariants(product.id);
            if (productVariants && productVariants.length > 0) {
              variantsMap.set(product.id, productVariants);
            }
          } catch (error) {
            console.error(`Error fetching variants for product ${product.id}:`, error);
          }
        }
        setVariants(variantsMap);

        // Fetch warehouses
        const warehousesData = await inventoryClient.getWarehouses();
        setWarehouses(warehousesData);

        // Fetch locations for each warehouse
        const locationsMap = new Map<string, IWarehouseLocation[]>();
        for (const warehouse of warehousesData) {
          try {
            // This endpoint is hypothetical - you'd need to implement it in your API
            const warehouseLocations = await inventoryClient.getWarehouseLocations(warehouse.id);
            locationsMap.set(warehouse.id, warehouseLocations);
          } catch (error) {
            console.error(`Error fetching locations for warehouse ${warehouse.id}:`, error);
          }
        }
        setLocations(locationsMap);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load required data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      await inventoryClient.createTransaction(data);
      
      toast({
        title: 'Success',
        description: 'Transaction created successfully.',
      });
      
      router.push('/dashboard/inventory/transactions');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction. Please try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/inventory/transactions');
  };

  return (
    <Container>
      <TransactionForm
        products={products}
        variants={variants}
        warehouses={warehouses}
        locations={locations}
        isLoading={isLoading || isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Container>
  );
} 