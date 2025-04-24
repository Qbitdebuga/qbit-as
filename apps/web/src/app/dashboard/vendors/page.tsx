'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VendorList } from '@/components/vendors/VendorList';
import { VendorsClient } from '@qbit/api-client';
import { Vendor } from '@qbit/shared-types';
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

export default function VendorsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);

  const vendorsClient = new VendorsClient('/api/accounts-payable');

  const loadVendors = async () => {
    setIsLoading(true);
    try {
      const response = await vendorsClient.getVendors({
        page,
        limit,
        search,
        sortBy,
        sortDirection,
      });
      setVendors(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: 'Error loading vendors',
        description: 'There was an error loading the vendors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [page, limit, sortBy, sortDirection]);

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1);
    loadVendors();
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortDirection(direction);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddNew = () => {
    router.push('/dashboard/vendors/new');
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/vendors/${id}`);
  };

  const confirmDelete = (id: number) => {
    setVendorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (vendorToDelete === null) return;

    try {
      await vendorsClient.deleteVendor(vendorToDelete.toString());
      toast({
        title: 'Vendor deleted',
        description: 'The vendor has been deleted successfully.',
      });
      loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error deleting vendor',
        description: 'There was an error deleting the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <VendorList
        vendors={vendors}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onAddNew={handleAddNew}
        sortBy={sortBy}
        sortDirection={sortDirection}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 