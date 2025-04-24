'use client';

import { Bill, BillStatus } from '@qbit-accounting/shared-types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format';
import BillLineItems from './BillLineItems';
import { format } from 'date-fns';

interface BillDetailProps {
  bill: Bill;
}

export default function BillDetail({ bill }: BillDetailProps) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Bill Information</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-sm font-medium">Bill Number</p>
                    <p className="text-sm">{bill.billNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(bill.status as BillStatus)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Issue Date</p>
                    <p className="text-sm">{format(new Date(bill.issueDate), 'PP')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm">{format(new Date(bill.dueDate), 'PP')}</p>
                  </div>
                  {bill.reference && (
                    <div>
                      <p className="text-sm font-medium">Reference</p>
                      <p className="text-sm">{bill.reference}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Information</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-sm font-medium">Subtotal</p>
                    <p className="text-sm">{formatCurrency(bill.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tax</p>
                    <p className="text-sm">{formatCurrency(bill.taxAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm font-bold">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount Paid</p>
                    <p className="text-sm">{formatCurrency(bill.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Balance Due</p>
                    <p className="text-sm text-destructive font-semibold">{formatCurrency(bill.balanceDue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Vendor Information</h3>
                <div className="mt-2">
                  <p className="font-medium">{bill.vendor?.name || 'Unknown Vendor'}</p>
                  {bill.vendor?.address && <p className="text-sm">{bill.vendor.address}</p>}
                  {bill.vendor?.city && bill.vendor?.state && (
                    <p className="text-sm">
                      {bill.vendor.city}, {bill.vendor.state} {bill.vendor.zipCode}
                    </p>
                  )}
                  {bill.vendor?.country && <p className="text-sm">{bill.vendor.country}</p>}
                  {bill.vendor?.email && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Email:</span> {bill.vendor.email}
                    </p>
                  )}
                  {bill.vendor?.phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {bill.vendor.phone}
                    </p>
                  )}
                </div>
              </div>
              {bill.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{bill.notes}</p>
                </div>
              )}
              {bill.terms && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Terms</h3>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{bill.terms}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Line Items</h3>
        {bill.lineItems && bill.lineItems.length > 0 ? (
          <BillLineItems lineItems={bill.lineItems} />
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">No line items found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 