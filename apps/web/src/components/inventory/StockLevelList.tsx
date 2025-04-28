'use client';

import React, { useState } from 'react';
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
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Loader2,
  Package,
  Warehouse,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { IInventoryLevel, IProduct, IProductVariant, IWarehouse } from '@qbit/shared-types';
import { formatCurrency } from '@/utils/format';

interface StockLevelListProps {
  stockLevels: IInventoryLevel[];
  products: Map<number, IProduct>;
  variants: Map<number, IProductVariant>;
  warehouses: Map<string, IWarehouse>;
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (term: string) => void;
  onSort: (field: string) => void;
  onWarehouseChange?: (warehouseId: string) => void;
  selectedWarehouseId?: string;
}

export function StockLevelList({
  stockLevels,
  products,
  variants,
  warehouses,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onSearch,
  onSort,
  onWarehouseChange,
  selectedWarehouseId,
}: StockLevelListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('quantity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    onSort(`${field}:${sortDirection}`);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const getItemName = (level: IInventoryLevel) => {
    if (level.variantId && variants.has(level.variantId)) {
      const variant = variants.get(level.variantId);
      return variant?.name || 'Unknown Variant';
    } else if (level.productId && products.has(level.productId)) {
      const product = products.get(level.productId);
      return product?.name || 'Unknown Product';
    }
    return 'Unknown Item';
  };

  const getItemSku = (level: IInventoryLevel) => {
    if (level.variantId && variants.has(level.variantId)) {
      const variant = variants.get(level.variantId);
      return variant?.sku || 'N/A';
    } else if (level.productId && products.has(level.productId)) {
      const product = products.get(level.productId);
      return product?.sku || 'N/A';
    }
    return 'N/A';
  };

  const getWarehouseName = (level: IInventoryLevel) => {
    if (warehouses.has(level.warehouseId)) {
      const warehouse = warehouses.get(level.warehouseId);
      return warehouse?.name || 'Unknown Warehouse';
    }
    return 'Unknown Warehouse';
  };

  const getStockStatus = (level: IInventoryLevel) => {
    const product = level.productId ? products.get(level.productId) : null;
    const variant = level.variantId ? variants.get(level.variantId) : null;
    const reorderPoint = level.reorderPoint || 
                         variant?.reorderPoint || 
                         product?.reorderPoint || 0;
    
    if (Number(level.quantity) <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (Number(level.quantity) < Number(reorderPoint)) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="outline">In Stock</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Inventory Stock Levels</CardTitle>
          <CardDescription>View current stock levels across warehouses</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-8 max-w-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>
            <Button variant="outline" onClick={handleSearchSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[100px] cursor-pointer"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center">
                      SKU {getSortIcon('sku')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Product {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('warehouse')}
                  >
                    <div className="flex items-center">
                      Warehouse {getSortIcon('warehouse')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end">
                      Quantity {getSortIcon('quantity')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : stockLevels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p>No inventory found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stockLevels.map((level) => (
                    <TableRow key={`${level.productId || ''}-${level.variantId || ''}-${level.warehouseId}`} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => level.productId && router.push(`/dashboard/products/${level.productId}`)}
                    >
                      <TableCell className="font-medium">
                        {getItemSku(level)}
                      </TableCell>
                      <TableCell>
                        {getItemName(level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Warehouse className="h-4 w-4 mr-2" />
                          {getWarehouseName(level)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(level.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStockStatus(level)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = page > 2 ? page - 2 + i : i + 1;
                  if (pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(pageNumber);
                          }}
                          isActive={pageNumber === page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 