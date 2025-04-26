'use client';

import React from 'react';
import { AccountForm } from '@/components/accounts/AccountForm';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function NewAccountPage() {
  // In a real app, this would be a server action or API call
  const handleSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    // In a real app, this would redirect to the accounts list or detail page
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/accounts" passHref>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
        <PageHeader title="Create New Account" description="Add a new account to your chart of accounts" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm 
            isSubmitting={false}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
} 