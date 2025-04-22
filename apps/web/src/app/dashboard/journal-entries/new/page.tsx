import React from 'react';
import { Metadata } from 'next';
import { JournalEntryForm } from '@/components/journal-entries/JournalEntryForm';
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from '@/components/page-header';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'New Journal Entry | Qbit Accounting',
  description: 'Create a new journal entry',
};

// In a real app, we would fetch this from the API
const accounts = [
  { 
    id: '1000', 
    code: '1000',
    name: 'Cash',
    type: 'ASSET',
    subtype: 'CASH',
    isActive: true
  },
  { 
    id: '1200', 
    code: '1200',
    name: 'Accounts Receivable',
    type: 'ASSET',
    subtype: 'ACCOUNTS_RECEIVABLE',
    isActive: true
  },
  { 
    id: '2000', 
    code: '2000',
    name: 'Accounts Payable',
    type: 'LIABILITY',
    subtype: 'ACCOUNTS_PAYABLE',
    isActive: true
  },
  { 
    id: '3000', 
    code: '3000',
    name: 'Common Stock',
    type: 'EQUITY',
    subtype: 'CAPITAL_STOCK',
    isActive: true
  },
  { 
    id: '4000', 
    code: '4000',
    name: 'Revenue',
    type: 'REVENUE',
    subtype: 'OPERATING_REVENUE',
    isActive: true
  },
  { 
    id: '5000', 
    code: '5000',
    name: 'Rent Expense',
    type: 'EXPENSE',
    subtype: 'OPERATING_EXPENSE',
    isActive: true
  },
  { 
    id: '5100', 
    code: '5100',
    name: 'Utilities Expense',
    type: 'EXPENSE',
    subtype: 'OPERATING_EXPENSE',
    isActive: true
  }
];

export default function NewJournalEntryPage() {
  // In a real app, this would call the API
  const handleSubmit = (data: any) => {
    console.log('Create journal entry:', data);
    // Navigate to journal entries list after successful creation
    // Use redirect or router.push in a real app
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <Link href="/dashboard/journal-entries" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal Entries
          </Button>
        </Link>
      </div>
      
      <PageHeader>
        <PageHeaderHeading>New Journal Entry</PageHeaderHeading>
        <PageHeaderDescription>
          Create a new journal entry transaction
        </PageHeaderDescription>
      </PageHeader>

      <JournalEntryForm 
        accounts={accounts} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
} 