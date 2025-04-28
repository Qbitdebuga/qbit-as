'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { 
  Button,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import BillForm from '@/components/bills/BillForm';

export default function NewBillPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/bills">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bills
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Create New Bill</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Bill</CardTitle>
          <CardDescription>
            Enter the details for the new vendor bill.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillForm 
            onSave={(billData) => {
              router.push('/dashboard/bills');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 