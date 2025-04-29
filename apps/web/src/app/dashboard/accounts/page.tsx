import React from 'react';
import { Metadata } from 'next';
import { AccountList } from '@/components/accounts/AccountList';
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from '@/components/page-header';
import { Button } from '@/components/ui';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { AccountType } from '@qbit/api-client';

// Mock data - in a real app, this would come from an API call
const accounts = [
  {
    id: '1',
    code: '1000',
    name: 'Cash',
    description: 'Cash on hand and in banks',
    type: AccountType.ASSET,
    subtype: 'CASH',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '1200',
    name: 'Accounts Receivable',
    description: 'Amounts due from customers',
    type: AccountType.ASSET,
    subtype: 'ACCOUNTS_RECEIVABLE',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: '2000',
    name: 'Accounts Payable',
    description: 'Amounts due to vendors',
    type: AccountType.LIABILITY,
    subtype: 'ACCOUNTS_PAYABLE',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    code: '3000',
    name: 'Retained Earnings',
    description: 'Accumulated earnings of the company',
    type: AccountType.EQUITY,
    subtype: 'RETAINED_EARNINGS',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    code: '4000',
    name: 'Sales Revenue',
    description: 'Income from sales',
    type: AccountType.REVENUE,
    subtype: 'SALES',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    code: '5000',
    name: 'Cost of Goods Sold',
    description: 'Cost of items sold',
    type: AccountType.EXPENSE,
    subtype: 'COST_OF_GOODS_SOLD',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const metadata: Metadata = {
  title: 'Chart of Accounts | Qbit Accounting',
  description: 'Manage your chart of accounts',
};

export default function AccountsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader>
          <PageHeaderHeading>Chart of Accounts</PageHeaderHeading>
          <PageHeaderDescription>
            Manage your chart of accounts and financial structure
          </PageHeaderDescription>
        </PageHeader>
        <Link href="/dashboard/accounts/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </Link>
      </div>

      <AccountList accounts={accounts} />
    </div>
  );
} 