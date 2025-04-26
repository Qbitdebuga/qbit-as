import React from 'react';
import { Metadata } from 'next';
import { AccountDetail } from '@/components/accounts/AccountDetail';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'Account Details | Qbit Accounting',
  description: 'View account details',
};

// Mock data - in a real app, this would come from an API call
const accounts = [
  {
    id: '1',
    code: '1000',
    name: 'Cash',
    description: 'Cash on hand and in banks',
    type: 'ASSET',
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
    type: 'ASSET',
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
    type: 'LIABILITY',
    subtype: 'ACCOUNTS_PAYABLE',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AccountDetailPage({ params }: Props) {
  // Find the account by ID (in a real app, this would be an API call)
  const account = accounts.find((acc) => acc.id === params.id);

  // If not found, show 404 page
  if (!account) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <AccountDetail account={account} />
    </div>
  );
} 