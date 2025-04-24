'use client';

import { BillLineItem } from '@qbit-accounting/shared-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format';

interface BillLineItemsProps {
  lineItems: BillLineItem[];
}

export default function BillLineItems({ lineItems }: BillLineItemsProps) {
  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Description</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            {lineItems.some(item => item.taxRate) && (
              <TableHead className="text-right">Tax Rate</TableHead>
            )}
            {lineItems.some(item => item.taxAmount) && (
              <TableHead className="text-right">Tax Amount</TableHead>
            )}
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">
                {item.description}
                {item.accountCode && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Account: {item.accountCode}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
              {lineItems.some(item => item.taxRate) && (
                <TableCell className="text-right">
                  {item.taxRate ? `${item.taxRate}%` : '-'}
                </TableCell>
              )}
              {lineItems.some(item => item.taxAmount) && (
                <TableCell className="text-right">
                  {item.taxAmount ? formatCurrency(item.taxAmount) : '-'}
                </TableCell>
              )}
              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={
              2 +
              (lineItems.some(item => item.taxRate) ? 1 : 0) +
              (lineItems.some(item => item.taxAmount) ? 1 : 0)
            }>
              <div className="font-medium">Total</div>
            </TableCell>
            <TableCell className="text-right">
              <div className="font-medium">{formatCurrency(calculateTotal())}</div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
} 