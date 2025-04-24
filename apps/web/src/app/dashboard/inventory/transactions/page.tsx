'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { TransactionList } from '@/components/inventory/TransactionList';
import { Button } from '@/components/ui/button';
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
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { inventoryClient } from '@qbit-accounting/api-client';
import { IInventoryTransaction, IWarehouse } from '@qbit-accounting/shared-types';

export default function TransactionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<IInventoryTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<Map<string, IWarehouse>>(new Map());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('transactionDate:desc');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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

        // Fetch transactions with filters
        const transactionsResponse = await inventoryClient.getTransactions({
          page,
          limit,
          searchTerm,
          orderBy: sort,
        });

        setTransactions(transactionsResponse.data);
        setTotal(transactionsResponse.meta.total);

      } catch (error) {
        console.error('Error fetching transaction data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transaction data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, limit, searchTerm, sort, toast]);

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

  const handleCreateTransaction = () => {
    router.push('/dashboard/inventory/transactions/new');
  };

  const handleEditTransaction = (id: string) => {
    router.push(`/dashboard/inventory/transactions/${id}/edit`);
  };

  const handleViewTransaction = (id: string) => {
    router.push(`/dashboard/inventory/transactions/${id}`);
  };

  const handleProcessTransaction = (id: string) => {
    router.push(`/dashboard/inventory/transactions/${id}/process`);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      await inventoryClient.deleteTransaction(transactionToDelete);
      
      // Remove from local state
      setTransactions(transactions.filter(t => t.id !== transactionToDelete));
      
      toast({
        title: 'Success',
        description: 'Transaction has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTransactionToDelete(null);
    }
  };

  const handleBackToInventory = () => {
    router.push('/dashboard/inventory');
  };

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading
          title="Inventory Transactions"
          description="Manage inventory movements, transfers, and adjustments"
        />
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBackToInventory}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          <Button onClick={handleCreateTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <TransactionList
        transactions={transactions}
        warehouses={warehouses}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        onSort={handleSort}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onView={handleViewTransaction}
        onProcess={handleProcessTransaction}
        onAddNew={handleCreateTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
} 