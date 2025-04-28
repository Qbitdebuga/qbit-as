'use client';

import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function InventoryTransactionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Inventory Transactions</h1>
        </div>
        <Link href="/dashboard/inventory/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Transaction history placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
