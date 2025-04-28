import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronDown,
  ChevronUp,
  FileEdit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Loader2,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Customer } from '@qbit/shared-types';
import { formatDate } from '@/utils/date';

interface CustomerListProps {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export function CustomerList({
  customers,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onSearch,
  onSort,
  onEdit,
  onDelete,
  onAddNew,
  sortBy = 'createdAt',
  sortDirection = 'desc',
}: CustomerListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleSort = (field: string) => {
    const direction = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, direction);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSortIcon = (field: string) => {
    if (field !== sortBy) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Manage your customer accounts</CardDescription>
        </div>
        <Button onClick={onAddNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8 max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button variant="outline" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort('customerNumber')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer #</span>
                      {getSortIcon('customerNumber')}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead onClick={() => handleSort('isActive')} className="cursor-pointer">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('isActive')}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 block">Loading customers...</span>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="text-center text-muted-foreground">
                        <p>No customers found</p>
                        <Button variant="link" onClick={onAddNew}>
                          Add your first customer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell
                        className="font-medium"
                        onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                      >
                        {customer.customerNumber}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        {customer.name}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        {customer.email}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        {customer.phone}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        <Badge variant={customer.isActive ? 'default' : 'outline'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(customer.id)}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(customer.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1 || isLoading}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Show pages around the current page
                  let pageNum;
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    // If near the start, show first 5 pages
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    // If near the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 before and 2 after current page
                    pageNum = page - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={pageNum === page}
                        disabled={isLoading}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || isLoading}
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
