'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { BillStatus } from '@/mocks/shared-types';

export default function BillsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bills</h1>
        <Link href="/dashboard/bills/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <p className="text-center py-10">Bill list placeholder</p>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <p className="text-center py-10">Draft bills placeholder</p>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <p className="text-center py-10">Pending bills placeholder</p>
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <p className="text-center py-10">Approved bills placeholder</p>
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <p className="text-center py-10">Paid bills placeholder</p>
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              <p className="text-center py-10">Overdue bills placeholder</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
