'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui';

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard/inventory/transactions/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </Link>
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Inventory management placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
} 