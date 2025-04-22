import React from 'react';
import { Metadata } from 'next';
import { JournalEntryList } from '@/components/journal-entries/JournalEntryList';
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from '@/components/page-header';
import { Button } from '@/components/ui';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data - in a real app, this would come from an API call
const journalEntries = [
  {
    id: '1',
    entryNumber: 'JE-202304-0001',
    date: '2023-04-15T00:00:00Z',
    description: 'Monthly rent payment',
    reference: 'Check #1234',
    status: 'POSTED',
    isAdjustment: false,
    lines: [
      {
        id: '101',
        journalEntryId: '1',
        accountId: '5000',
        account: { 
          id: '5000', 
          code: '5000',
          name: 'Rent Expense',
          type: 'EXPENSE',
          subtype: 'OPERATING_EXPENSE',
          isActive: true
        },
        description: 'Office rent',
        debit: 2500,
        credit: undefined,
        createdAt: '2023-04-15T14:30:00Z',
        updatedAt: '2023-04-15T14:30:00Z'
      },
      {
        id: '102',
        journalEntryId: '1',
        accountId: '1000',
        account: { 
          id: '1000', 
          code: '1000',
          name: 'Cash',
          type: 'ASSET',
          subtype: 'CASH',
          isActive: true
        },
        description: '',
        debit: undefined,
        credit: 2500,
        createdAt: '2023-04-15T14:30:00Z',
        updatedAt: '2023-04-15T14:30:00Z'
      }
    ],
    createdAt: '2023-04-15T14:30:00Z',
    updatedAt: '2023-04-15T14:30:00Z'
  },
  {
    id: '2',
    entryNumber: 'JE-202304-0002',
    date: '2023-04-20T00:00:00Z',
    description: 'Client invoice payment received',
    reference: 'Invoice #5678',
    status: 'POSTED',
    isAdjustment: false,
    lines: [
      {
        id: '201',
        journalEntryId: '2',
        accountId: '1000',
        account: { 
          id: '1000', 
          code: '1000',
          name: 'Cash',
          type: 'ASSET',
          subtype: 'CASH',
          isActive: true
        },
        description: 'Payment received',
        debit: 5000,
        credit: undefined,
        createdAt: '2023-04-20T10:15:00Z',
        updatedAt: '2023-04-20T10:15:00Z'
      },
      {
        id: '202',
        journalEntryId: '2',
        accountId: '1200',
        account: { 
          id: '1200', 
          code: '1200',
          name: 'Accounts Receivable',
          type: 'ASSET',
          subtype: 'ACCOUNTS_RECEIVABLE',
          isActive: true
        },
        description: '',
        debit: undefined,
        credit: 5000,
        createdAt: '2023-04-20T10:15:00Z',
        updatedAt: '2023-04-20T10:15:00Z'
      }
    ],
    createdAt: '2023-04-20T10:15:00Z',
    updatedAt: '2023-04-20T10:15:00Z'
  },
  {
    id: '3',
    entryNumber: 'JE-202304-0003',
    date: '2023-04-25T00:00:00Z',
    description: 'Monthly utilities',
    reference: '',
    status: 'DRAFT',
    isAdjustment: false,
    lines: [
      {
        id: '301',
        journalEntryId: '3',
        accountId: '5100',
        account: { 
          id: '5100', 
          code: '5100',
          name: 'Utilities Expense',
          type: 'EXPENSE',
          subtype: 'OPERATING_EXPENSE',
          isActive: true
        },
        description: 'Electricity bill',
        debit: 350,
        credit: undefined,
        createdAt: '2023-04-25T16:45:00Z',
        updatedAt: '2023-04-25T16:45:00Z'
      },
      {
        id: '302',
        journalEntryId: '3',
        accountId: '2000',
        account: { 
          id: '2000', 
          code: '2000',
          name: 'Accounts Payable',
          type: 'LIABILITY',
          subtype: 'ACCOUNTS_PAYABLE',
          isActive: true
        },
        description: '',
        debit: undefined,
        credit: 350,
        createdAt: '2023-04-25T16:45:00Z',
        updatedAt: '2023-04-25T16:45:00Z'
      }
    ],
    createdAt: '2023-04-25T16:45:00Z',
    updatedAt: '2023-04-25T16:45:00Z'
  }
];

export const metadata: Metadata = {
  title: 'Journal Entries | Qbit Accounting',
  description: 'Manage your journal entries',
};

export default function JournalEntriesPage() {
  // In a real app, these would call the API
  const handleDelete = (id: string) => {
    console.log('Delete journal entry:', id);
  };

  const handlePost = (id: string) => {
    console.log('Post journal entry:', id);
  };

  const handleReverse = (id: string) => {
    console.log('Reverse journal entry:', id);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader>
          <PageHeaderHeading>Journal Entries</PageHeaderHeading>
          <PageHeaderDescription>
            Record and manage your financial transactions
          </PageHeaderDescription>
        </PageHeader>
        <Link href="/dashboard/journal-entries/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Journal Entry
          </Button>
        </Link>
      </div>

      <JournalEntryList 
        entries={journalEntries} 
        onDelete={handleDelete}
        onPost={handlePost}
        onReverse={handleReverse}
      />
    </div>
  );
} 