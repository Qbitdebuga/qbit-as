'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define a local InvoiceLineItem type that matches the form requirements
interface SimpleInvoiceLineItem {
  id: string | number;
  description: string;
  quantity: number;
  unitPrice: number;
  productId: string | number;
}

interface LineItemsProps {
  lineItems: SimpleInvoiceLineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<SimpleInvoiceLineItem[]>>;
}

export default function LineItems({ lineItems, setLineItems }: LineItemsProps) {
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: '', description: '', quantity: 1, unitPrice: 0, productId: '' },
    ]);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
  };

  const updateLineItem = (index: number, field: keyof SimpleInvoiceLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    } as SimpleInvoiceLineItem;
    setLineItems(updatedItems);
  };

  // Calculate line total
  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  {calculateLineTotal(item.quantity, item.unitPrice).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {lineItems
                .reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
