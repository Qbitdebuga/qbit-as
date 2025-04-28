'use client';

import React from 'react';
import { Bill, BillStatus } from '@/mocks/shared-types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface BillDetailProps {
  bill: Bill;
}

const BillDetail: React.FC<BillDetailProps> = ({ bill }) => {
  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case BillStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case BillStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case BillStatus.APPROVED:
        return <Badge variant="default">Approved</Badge>;
      case BillStatus.PARTIAL:
        return <Badge variant="secondary">Partially Paid</Badge>;
      case BillStatus.PAID:
        return <Badge variant="success">Paid</Badge>;
      case BillStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      case BillStatus.OVERDUE:
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bill Number</p>
              <p className="text-lg font-semibold">{bill.billNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="text-lg">{getStatusBadge(bill.status as BillStatus)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendor</p>
              <p className="text-lg font-semibold">{bill.vendor?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg font-semibold">
                {formatDate(bill.date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">
                {formatDate(bill.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(bill.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Account</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Unit Price</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.lineItems?.map((item, index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">{item.account?.name || 'N/A'}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td colSpan={4} className="p-2 text-right">Subtotal:</td>
                  <td className="p-2 text-right">{formatCurrency(bill.subtotal || 0)}</td>
                </tr>
                <tr className="font-medium">
                  <td colSpan={4} className="p-2 text-right">Tax:</td>
                  <td className="p-2 text-right">{formatCurrency(bill.taxAmount || 0)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={4} className="p-2 text-right">Total:</td>
                  <td className="p-2 text-right">{formatCurrency(bill.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillDetail; 