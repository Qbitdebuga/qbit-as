import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { AccountDetail } from '@/components/accounts/AccountDetail';
import { notFound } from 'next/navigation';
import { AccountType } from '@qbit/api-client';

// Define the params prop shape
type Params = {
  id: string;
};

// Next.js standard PageProps type
type Props = {
  params: Params;
  searchParams: Record<string, string | string[] | undefined>;
};

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
];

// Proper generateMetadata function for dynamic routes
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // In a real app, fetch the account data
  const account = accounts.find(acc => acc.id === params.id);
  
  // If account not found, return default metadata
  if (!account) {
    return {
      title: 'Account Not Found | Qbit Accounting',
      description: 'The requested account could not be found',
    };
  }
  
  // Get parent/default metadata values
  const previousImage = (await parent).openGraph?.images || [];
  
  return {
    title: `${account.name} (${account.code}) | Qbit Accounting`,
    description: account.description || 'View account details and transactions',
    openGraph: {
      title: `${account.name} - Account Details`,
      description: account.description || 'Account details in Qbit Accounting System',
      images: previousImage,
    },
  };
}

// Simple page component with exact Next.js type pattern
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