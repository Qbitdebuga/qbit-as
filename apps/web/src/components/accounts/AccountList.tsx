'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Account, AccountType } from '@qbit/api-client';

interface AccountListProps {
  accounts: Account[];
  onDelete?: (id: string) => void;
}

const getAccountTypeColor = (type: AccountType) => {
  switch (type) {
    case 'ASSET':
      return 'bg-blue-100 text-blue-800';
    case 'LIABILITY':
      return 'bg-red-100 text-red-800';
    case 'EQUITY':
      return 'bg-green-100 text-green-800';
    case 'REVENUE':
      return 'bg-purple-100 text-purple-800';
    case 'EXPENSE':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function AccountList({ accounts, onDelete }: AccountListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart of Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subtype</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.code}</TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>{account.subtype.replace(/_/g, ' ')}</TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'success' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/dashboard/accounts/${account.id}`} passHref>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/accounts/${account.id}/edit`} passHref>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(account.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
