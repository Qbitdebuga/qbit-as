import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from '@/components/ui';
import { JournalEntry } from '@qbit/shared-types';
import Link from 'next/link';
import { Edit, Eye, Trash2, Check, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => void;
  onPost?: (id: string) => void;
  onReverse?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'POSTED':
      return 'bg-green-100 text-green-800';
    case 'REVERSED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const JournalEntryList: React.FC<JournalEntryListProps> = ({
  entries,
  onDelete,
  onPost,
  onReverse,
}) => {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotal = (entry: JournalEntry, type: 'debit' | 'credit') => {
    return entry.lines.reduce((total, line) => {
      return total + (line[type] || 0);
    }, 0);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of Journal Entries</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Entry Number</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[120px]">Debits</TableHead>
            <TableHead className="w-[120px]">Credits</TableHead>
            <TableHead className="text-center w-[100px]">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.entryNumber}</TableCell>
              <TableCell>{format(new Date(entry.date), 'MM/dd/yyyy')}</TableCell>
              <TableCell>{entry.description || '—'}</TableCell>
              <TableCell>{formatCurrency(calculateTotal(entry, 'debit'))}</TableCell>
              <TableCell>{formatCurrency(calculateTotal(entry, 'credit'))}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={getStatusColor(entry.status)}>
                  {entry.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Link href={`/dashboard/journal-entries/${entry.id}`} passHref>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {entry.status === 'DRAFT' && (
                    <>
                      <Link href={`/dashboard/journal-entries/${entry.id}/edit`} passHref>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      {onPost && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPost(entry.id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}

                  {entry.status === 'POSTED' && onReverse && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReverse(entry.id)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <RotateCcw className="h-4 w-4" />
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
