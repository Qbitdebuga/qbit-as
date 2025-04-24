'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileEdit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react';
import { IInventoryTransaction, IWarehouse } from '@qbit-accounting/shared-types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';

interface TransactionListProps {
  transactions: IInventoryTransaction[];
  warehouses: Map<string, IWarehouse>;
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (term: string) => void;
  onSort: (field: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onProcess: (id: string) => void;
  onAddNew: () => void;
}

export function TransactionList({
  transactions,
  warehouses,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onLimitChange,
  onSearch,
  onSort,
  onEdit,
  onDelete,
  onView,
  onProcess,
  onAddNew,
}: TransactionListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('transactionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    onSort(`${field}:${sortDirection}`);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Pending</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'receipt':
        return <Badge variant="outline" className="border-green-500 text-green-500">Receipt</Badge>;
      case 'shipment':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Shipment</Badge>;
      case 'transfer':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Transfer</Badge>;
      case 'adjustment':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Adjustment</Badge>;
      case 'count':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Count</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getWarehouseNames = (transaction: IInventoryTransaction) => {
    let result = '';
    
    if (transaction.sourceWarehouseId && warehouses.has(transaction.sourceWarehouseId)) {
      const sourceName = warehouses.get(transaction.sourceWarehouseId)?.name || 'Unknown';
      result += sourceName;
    }
    
    if (transaction.sourceWarehouseId && transaction.targetWarehouseId) {
      result += ' → ';
    }
    
    if (transaction.targetWarehouseId && warehouses.has(transaction.targetWarehouseId)) {
      const targetName = warehouses.get(transaction.targetWarehouseId)?.name || 'Unknown';
      result += targetName;
    }
    
    return result || 'N/A';
  };

  const canProcessTransaction = (transaction: IInventoryTransaction) => {
    return ['draft', 'pending'].includes(transaction.status.toLowerCase());
  };

  const canEditTransaction = (transaction: IInventoryTransaction) => {
    return transaction.status.toLowerCase() === 'draft';
  };

  const canDeleteTransaction = (transaction: IInventoryTransaction) => {
    return transaction.status.toLowerCase() === 'draft';
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Inventory Transactions</CardTitle>
          <CardDescription>Manage inventory movements, transfers, and adjustments</CardDescription>
        </div>
        <Button onClick={onAddNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference number..."
                className="pl-8 max-w-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>
            <Button variant="outline" onClick={handleSearchSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('transactionType')}
                  >
                    <div className="flex items-center">
                      Type {getSortIcon('transactionType')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('referenceNumber')}
                  >
                    <div className="flex items-center">
                      Reference {getSortIcon('referenceNumber')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('warehouses')}
                  >
                    <div className="flex items-center">
                      Warehouse(s) {getSortIcon('warehouses')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('transactionDate')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('transactionDate')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="text-center text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p>No transactions found</p>
                        <Button variant="link" onClick={onAddNew}>
                          Create your first transaction
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell>
                        {getTypeBadge(transaction.transactionType)}
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => onView(transaction.id)}
                      >
                        {transaction.referenceNumber || transaction.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {transaction.transactionType.toLowerCase() === 'transfer' ? (
                            <>
                              {getWarehouseNames(transaction)}
                            </>
                          ) : (
                            getWarehouseNames(transaction)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(transaction.transactionDate))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onView(transaction.id)}
                              className="cursor-pointer"
                            >
                              <ClipboardList className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            
                            {canProcessTransaction(transaction) && (
                              <DropdownMenuItem
                                onClick={() => onProcess(transaction.id)}
                                className="cursor-pointer"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Process
                              </DropdownMenuItem>
                            )}
                            
                            {canEditTransaction(transaction) && (
                              <DropdownMenuItem
                                onClick={() => onEdit(transaction.id)}
                                className="cursor-pointer"
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            
                            {canDeleteTransaction(transaction) && (
                              <DropdownMenuItem
                                onClick={() => onDelete(transaction.id)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = page > 2 ? page - 2 + i : i + 1;
                  if (pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(pageNumber);
                          }}
                          isActive={pageNumber === page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 