'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse } from 'lucide-react';
import { IWarehouse } from '@qbit/shared-types';

interface WarehouseSelectorProps {
  warehouses: IWarehouse[];
  selectedWarehouseId?: string;
  onWarehouseChange: (warehouseId: string) => void;
  title?: string;
  description?: string;
}

export function WarehouseSelector({
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  title = 'Select Warehouse',
  description = 'Choose a warehouse to view inventory',
}: WarehouseSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Warehouse className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedWarehouseId || ''} onValueChange={onWarehouseChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Warehouses</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
