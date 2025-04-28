'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function NewInventoryTransactionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">New Inventory Transaction</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Inventory Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Transaction form placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
