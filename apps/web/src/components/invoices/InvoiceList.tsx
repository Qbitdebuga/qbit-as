'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Invoice, InvoiceStatus } from '@qbit/shared-types';
import { useInvoices } from '@/hooks/useInvoices';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/utils/formatters';

const statusColorMap: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-200 text-gray-800',
  PENDING: 'bg-yellow-200 text-yellow-800',
  SENT: 'bg-blue-200 text-blue-800',
  PARTIAL: 'bg-purple-200 text-purple-800',
  PAID: 'bg-green-200 text-green-800',
  OVERDUE: 'bg-red-200 text-red-800',
  VOID: 'bg-gray-200 text-gray-800 line-through',
  CANCELLED: 'bg-gray-200 text-gray-800 line-through'
};

export default function InvoiceList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const { invoices, isLoading, error, refetch } = useInvoices({
    status: statusFilter !== 'ALL' ? statusFilter as InvoiceStatus : undefined
  });
  
  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customerReference && invoice.customerReference.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateNew = () => {
    router.push('/dashboard/invoices/new');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage your customer invoices</CardDescription>
        </div>
        <Button onClick={handleCreateNew}>Create New Invoice</Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="w-1/3">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-1/4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading invoices...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading invoices: {error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.customerReference || '-'}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={statusColorMap[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.balanceDue)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 