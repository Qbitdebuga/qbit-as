'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorForm } from '@/components/vendors/VendorForm';
import { VendorsClient } from '@qbit/api-client';
import { CreateVendorDto } from '@qbit/shared-types';
import { useToast } from '@/components/ui/use-toast';

export default function NewVendorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const vendorsClient = new VendorsClient('/api/accounts-payable');

  const handleSubmit = async (data: CreateVendorDto) => {
    setIsSubmitting(true);
    try {
      const newVendor = await vendorsClient.createVendor(data);
      toast({
        title: 'Vendor created',
        description: 'New vendor has been created successfully.',
      });
      router.push(`/dashboard/vendors/${newVendor.id}`);
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast({
        title: 'Error creating vendor',
        description: 'There was an error creating the vendor. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Vendor</h1>
        <p className="text-muted-foreground">Create a new vendor in your accounting system</p>
      </div>
      
      <VendorForm 
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
} 