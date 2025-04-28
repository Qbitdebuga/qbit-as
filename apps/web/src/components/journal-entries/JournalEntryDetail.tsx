import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Separator,
} from '@/components/ui';
import { JournalEntry } from '@qbit/shared-types';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Edit, CheckCircle, RotateCcw } from 'lucide-react';

interface JournalEntryDetailProps {
  entry: JournalEntry;
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

export const JournalEntryDetail: React.FC<JournalEntryDetailProps> = ({
  entry,
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

  const calculateTotal = (type: 'debit' | 'credit') => {
    return entry.lines.reduce((total, line) => {
      return total + (line[type] || 0);
    }, 0);
  };

  const totalDebits = calculateTotal('debit');
  const totalCredits = calculateTotal('credit');
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl">Journal Entry: {entry.entryNumber}</CardTitle>
          <div className="flex gap-2">
            {entry.status === 'DRAFT' && (
              <>
                <Link href={`/dashboard/journal-entries/${entry.id}/edit`} passHref>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>

                {onPost && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPost(entry.id)}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                )}
              </>
            )}

            {entry.status === 'POSTED' && onReverse && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReverse(entry.id)}
                className="text-orange-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reverse
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(entry.status)}>
              {entry.status}
            </Badge>
            {entry.isAdjustment && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Adjustment
              </Badge>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Last updated {formatDistanceToNow(new Date(entry.updatedAt))} ago
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium">Date</h3>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(entry.date), 'MMMM dd, yyyy')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Reference</h3>
              <p className="text-sm text-gray-500 mt-1">
                {entry.reference || 'No reference provided'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(entry.createdAt), 'MM/dd/yyyy h:mm a')}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-gray-500 mt-1">
              {entry.description || 'No description provided'}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-3">Journal Entry Lines</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.account?.code || ''}</TableCell>
                    <TableCell>{line.account?.name || ''}</TableCell>
                    <TableCell>{line.description || '—'}</TableCell>
                    <TableCell className="text-right">
                      {line.debit ? formatCurrency(line.debit) : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      {line.credit ? formatCurrency(line.credit) : ''}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell colSpan={3} className="text-right">
                    Totals
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <Badge variant={isBalanced ? 'success' : 'destructive'}>
                {isBalanced
                  ? 'Balanced'
                  : `Unbalanced: ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/dashboard/journal-entries" passHref>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal Entries
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
