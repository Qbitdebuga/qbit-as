'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { StockLevelList } from '@/components/inventory/StockLevelList';
import { WarehouseSelector } from '@/components/inventory/WarehouseSelector';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { inventoryClient } from '@qbit-accounting/api-client';
import { productsClient } from '@qbit-accounting/api-client';
import { IInventoryLevel, IProduct, IProductVariant, IWarehouse } from '@qbit-accounting/shared-types';

export default function InventoryPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [stockLevels, setStockLevels] = useState<IInventoryLevel[]>([]);
  const [products, setProducts] = useState<Map<number, IProduct>>(new Map());
  const [variants, setVariants] = useState<Map<number, IProductVariant>>(new Map());
  const [warehouses, setWarehouses] = useState<Map<string, IWarehouse>>(new Map());
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('quantity:desc');

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch warehouses
        const warehousesData = await inventoryClient.getWarehouses();
        const warehousesMap = new Map();
        warehousesData.forEach(warehouse => warehousesMap.set(warehouse.id, warehouse));
        setWarehouses(warehousesMap);

        // Fetch inventory levels with filters
        const inventoryResponse = await inventoryClient.getInventoryLevels({
          page,
          limit,
          searchTerm,
          orderBy: sort,
          warehouseId: selectedWarehouseId || undefined
        });

        setStockLevels(inventoryResponse.data);
        setTotal(inventoryResponse.meta.total);

        // Get unique product and variant IDs
        const productIds = new Set<number>();
        const variantIds = new Set<number>();

        inventoryResponse.data.forEach(level => {
          if (level.productId) productIds.add(level.productId);
          if (level.variantId) variantIds.add(level.variantId);
        });

        // Fetch products and variants
        if (productIds.size > 0) {
          const productsResponse = await productsClient.getProducts({
            ids: Array.from(productIds)
          });
          
          const productsMap = new Map();
          productsResponse.data.forEach(product => productsMap.set(product.id, product));
          setProducts(productsMap);
        }

        // We would typically fetch variants in bulk, but we'll simulate that here
        // In a real implementation, we would have a bulk endpoint to fetch variants by IDs
        const variantsMap = new Map();
        if (variantIds.size > 0) {
          for (const productId of productIds) {
            try {
              const productVariants = await productsClient.getVariants(productId);
              productVariants.forEach(variant => {
                if (variantIds.has(variant.id)) {
                  variantsMap.set(variant.id, variant);
                }
              });
            } catch (error) {
              console.error(`Error fetching variants for product ${productId}:`, error);
            }
          }
        }
        setVariants(variantsMap);

      } catch (error) {
        console.error('Error fetching inventory data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inventory data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, limit, searchTerm, sort, selectedWarehouseId, toast]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleSort = (field: string) => {
    setSort(field);
    setPage(1);
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setPage(1);
  };

  const handleCreateTransaction = () => {
    router.push('/dashboard/inventory/transactions/new');
  };

  const handleViewTransactions = () => {
    router.push('/dashboard/inventory/transactions');
  };

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading
          title="Inventory Management"
          description="View and manage inventory across your warehouses"
        />
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleViewTransactions}>
            View Transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={handleCreateTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <WarehouseSelector
            warehouses={Array.from(warehouses.values())}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseChange={handleWarehouseChange}
          />
        </div>

        <div className="md:col-span-3">
          <StockLevelList
            stockLevels={stockLevels}
            products={products}
            variants={variants}
            warehouses={warehouses}
            total={total}
            page={page}
            limit={limit}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onSearch={handleSearch}
            onSort={handleSort}
            onWarehouseChange={handleWarehouseChange}
            selectedWarehouseId={selectedWarehouseId}
          />
        </div>
      </div>
    </Container>
  );
} 