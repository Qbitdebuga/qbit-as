'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bill, BillStatus } from '@qbit-accounting/shared-types';
import { BillsApiClient } from '@qbit-accounting/api-client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  FileEdit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Calendar
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/format';

interface BillListProps {
  status?: BillStatus;
  vendorId?: string;
}

const billsApiClient = new BillsApiClient();

export default function BillList({ status, vendorId }: BillListProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (token) {
      billsApiClient.setAuthToken(token);
      fetchBills();
    }
  }, [token, status, vendorId, page, limit, search, fromDate, toDate]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit,
        search: search || undefined,
      };

      if (status) {
        params.status = status;
      }

      if (vendorId) {
        params.vendorId = vendorId;
      }

      if (fromDate) {
        params.fromDate = format(fromDate, 'yyyy-MM-dd');
      }

      if (toDate) {
        params.toDate = format(toDate, 'yyyy-MM-dd');
      }

      const response = await billsApiClient.getBills(params);
      setBills(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleBillClick = (id: string) => {
    router.push(`/dashboard/bills/${id}`);
  };

  const getStatusBadge = (status: BillStatus) => {
    const variants: Record<BillStatus, { variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success', label: string }> = {
      [BillStatus.DRAFT]: { variant: 'outline', label: 'Draft' },
      [BillStatus.PENDING]: { variant: 'secondary', label: 'Pending' },
      [BillStatus.APPROVED]: { variant: 'default', label: 'Approved' },
      [BillStatus.PAID]: { variant: 'success', label: 'Paid' },
      [BillStatus.PARTIALLY_PAID]: { variant: 'secondary', label: 'Partially Paid' },
      [BillStatus.OVERDUE]: { variant: 'destructive', label: 'Overdue' },
      [BillStatus.CANCELLED]: { variant: 'outline', label: 'Cancelled' },
    };

    const config = variants[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DatePicker
            placeholder="From date"
            date={fromDate}
            onDateChange={setFromDate}
            className="w-full sm:w-auto"
          />
          <DatePicker
            placeholder="To date"
            date={toDate}
            onDateChange={setToDate}
            className="w-full sm:w-auto"
          />
          <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
            <SelectTrigger className="w-full sm:w-[110px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading bills...</div>
      ) : bills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No bills found.</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow 
                    key={bill.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleBillClick(bill.id.toString())}
                  >
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{bill.vendor?.name || '-'}</TableCell>
                    <TableCell>{new Date(bill.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(bill.status as BillStatus)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.balanceDue)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleBillClick(bill.id.toString())}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/bills/${bill.id}/edit`);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page * limit >= total}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 