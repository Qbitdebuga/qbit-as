'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VendorDetail } from '@/components/vendors/VendorDetail';
import { VendorForm } from '@/components/vendors/VendorForm';
import { VendorsClient } from '@qbit/api-client';
import { Vendor, UpdateVendorDto } from '@qbit/shared-types';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VendorDetailPageProps {
  params: {
    id: string;
  };
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const vendorsClient = new VendorsClient('/api/accounts-payable');

  const loadVendor = async () => {
    setIsLoading(true);
    try {
      const data = await vendorsClient.getVendorById(params.id);
      setVendor(data);
    } catch (error) {
      console.error('Error loading vendor:', error);
      toast({
        title: 'Error loading vendor',
        description: 'There was an error loading the vendor details. Please try again.',
        variant: 'destructive',
      });
      router.push('/dashboard/vendors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleUpdate = async (data: UpdateVendorDto) => {
    setIsSubmitting(true);
    try {
      const updatedVendor = await vendorsClient.updateVendor(params.id, data);
      setVendor(updatedVendor);
      setIsEditing(false);
      setActiveTab('details');
      toast({
        title: 'Vendor updated',
        description: 'Vendor has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: 'Error updating vendor',
        description: 'There was an error updating the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await vendorsClient.deleteVendor(params.id);
      toast({
        title: 'Vendor deleted',
        description: 'The vendor has been deleted successfully.',
      });
      router.push('/dashboard/vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error deleting vendor',
        description: 'There was an error deleting the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mt-2">Loading vendor details...</span>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vendor Not Found</h1>
          <p className="mb-4">The vendor you are looking for does not exist or has been deleted.</p>
          <Button onClick={() => router.push('/dashboard/vendors')}>Back to Vendors</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/dashboard/vendors')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <VendorDetail 
            vendor={vendor} 
            onEdit={handleEdit} 
            onDelete={confirmDelete}
          />
        </TabsContent>
        <TabsContent value="edit" className="mt-6">
          <VendorForm 
            initialData={vendor}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
            isEditMode={true}
          />
        </TabsContent>
      </Tabs>

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