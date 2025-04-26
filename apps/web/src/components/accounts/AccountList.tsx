'use client';

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Button,
  Badge
} from "@/components/ui";
import { Account, AccountType } from '@qbit/api-client';
import Link from 'next/link';
import { Edit, Eye, Trash2 } from 'lucide-react';

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

export const AccountList: React.FC<AccountListProps> = ({ accounts, onDelete }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of Chart of Accounts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subtype</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.code}</TableCell>
              <TableCell>{account.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getAccountTypeColor(account.type)}>
                  {account.type}
                </Badge>
              </TableCell>
              <TableCell>{account.subtype.replace(/_/g, ' ')}</TableCell>
              <TableCell className="text-center">
                {account.isActive ? (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
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
    </div>
  );
}; 