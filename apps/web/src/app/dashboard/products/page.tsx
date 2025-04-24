'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/products/ProductList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { productsClient } from '@qbit-accounting/api-client';
import { IProduct } from '@qbit-accounting/shared-types';

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [page, limit, searchTerm, sortField, sortOrder, activeTab]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would call the API
      // const response = await productsClient.getProducts({
      //   page,
      //   limit,
      //   search: searchTerm,
      //   sortBy: sortField,
      //   sortOrder,
      //   isActive: activeTab === 'active' ? true : activeTab === 'inactive' ? false : undefined,
      // });
      
      // For demo, use mock data
      setTimeout(() => {
        // Mock products data
        const mockProducts: IProduct[] = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          sku: `PROD-${(i + 1).toString().padStart(5, '0')}`,
          name: `Product ${i + 1}`,
          description: `Description for Product ${i + 1}`,
          categoryId: 1,
          price: Math.floor(Math.random() * 500) + 50,
          cost: Math.floor(Math.random() * 300) + 20,
          quantityOnHand: Math.floor(Math.random() * 100),
          reorderPoint: 5,
          isActive: Math.random() > 0.2,
          isSellable: true,
          isPurchasable: true,
          barcode: `BAR${(i + 1).toString().padStart(8, '0')}`,
          weight: Math.floor(Math.random() * 10) + 1,
          weightUnit: 'kg',
          dimensions: { length: 10, width: 10, height: 10 },
          taxable: true,
          taxRateId: 1,
          accountId: 1,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        
        setProducts(mockProducts);
        setTotalProducts(47); // Mock total for pagination
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddProduct = () => {
    router.push('/dashboard/products/new');
  };

  const handleEditProduct = (id: number) => {
    router.push(`/dashboard/products/${id}`);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      // In a real implementation, this would call the API
      // await productsClient.deleteProduct(id);
      
      // For demo, just remove from local state
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: 'Product deleted',
        description: 'The product has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the product. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Product List</CardTitle>
              <CardDescription>
                {totalProducts} total products in your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList
                products={products}
                total={totalProducts}
                page={page}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearch}
                onSort={handleSort}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Active Products</CardTitle>
              <CardDescription>
                Products currently available in your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList
                products={products.filter(p => p.isActive)}
                total={totalProducts}
                page={page}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearch}
                onSort={handleSort}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Inactive Products</CardTitle>
              <CardDescription>
                Products that are not currently active in your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList
                products={products.filter(p => !p.isActive)}
                total={totalProducts}
                page={page}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearch}
                onSort={handleSort}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 