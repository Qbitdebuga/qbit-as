'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import BillList from '@/components/bills/BillList';
import { BillStatus } from '@qbit-accounting/shared-types';

export default function BillsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
          <p className="text-muted-foreground">
            Manage vendor bills and purchase invoices.
          </p>
        </div>
        <Link href="/dashboard/bills/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills Overview</CardTitle>
          <CardDescription>
            View and manage all vendor bills in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <BillList status={undefined} />
            </TabsContent>
            <TabsContent value="draft" className="mt-6">
              <BillList status={BillStatus.DRAFT} />
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              <BillList status={BillStatus.PENDING} />
            </TabsContent>
            <TabsContent value="approved" className="mt-6">
              <BillList status={BillStatus.APPROVED} />
            </TabsContent>
            <TabsContent value="overdue" className="mt-6">
              <BillList status={BillStatus.OVERDUE} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 