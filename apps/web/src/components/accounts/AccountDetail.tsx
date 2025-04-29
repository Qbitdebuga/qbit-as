import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Button,
  Badge,
  Separator
} from '@/components/ui';
import { Account, AccountType } from '@qbit/api-client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Edit, ArrowLeft } from 'lucide-react';

interface AccountDetailProps {
  account: Account;
}

const getAccountTypeColor = (type: AccountType) => {
  switch (type) {
    case AccountType.ASSET:
      return 'bg-blue-100 text-blue-800';
    case AccountType.LIABILITY:
      return 'bg-red-100 text-red-800';
    case AccountType.EQUITY:
      return 'bg-green-100 text-green-800';
    case AccountType.REVENUE:
      return 'bg-purple-100 text-purple-800';
    case AccountType.EXPENSE:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const AccountDetail: React.FC<AccountDetailProps> = ({ account }) => {
  // Format enum values for display
  const formatEnumValue = (value: string) => {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl">
            {account.code} - {account.name}
          </CardTitle>
          <Link href={`/dashboard/accounts/${account.id}/edit`} passHref>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getAccountTypeColor(account.type)}>
              {account.type}
            </Badge>
            <Badge variant="outline">
              {formatEnumValue(account.subtype)}
            </Badge>
            {account.isActive ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">Inactive</Badge>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Last updated {formatDistanceToNow(new Date(account.updatedAt))} ago
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            {account.children && account.children.length > 0 && (
              <TabsTrigger value="subaccounts">Sub-accounts</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="details">
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {account.description || 'No description provided'}
                </p>
              </div>

              <Separator />

              {account.parent && (
                <div>
                  <h3 className="text-sm font-medium">Parent Account</h3>
                  <Link 
                    href={`/dashboard/accounts/${account.parent.id}`}
                    className="text-sm text-blue-600 hover:underline mt-1 block"
                  >
                    {account.parent.code} - {account.parent.name}
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(account.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(account.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="transactions">
            <div className="py-4">
              <p className="text-sm text-gray-500">Recent transactions will appear here.</p>
            </div>
          </TabsContent>
          {account.children && account.children.length > 0 && (
            <TabsContent value="subaccounts">
              <div className="py-4">
                <h3 className="text-sm font-medium mb-3">Sub-accounts</h3>
                <div className="space-y-2">
                  {account.children.map((childAccount) => (
                    <Link 
                      key={childAccount.id}
                      href={`/dashboard/accounts/${childAccount.id}`}
                      className="block p-3 rounded-md border hover:bg-gray-50"
                    >
                      <div className="font-medium">
                        {childAccount.code} - {childAccount.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatEnumValue(childAccount.subtype)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/dashboard/accounts" passHref>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}; 