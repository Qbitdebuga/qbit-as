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
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2,
  Loader2,
  SortAsc,
  SortDesc,
  FileEdit,
} from 'lucide-react';
import { Vendor } from '@qbit/shared-types';
import { formatDate } from '@/utils/date';

interface VendorListProps {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export function VendorList({
  vendors,
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
}: VendorListProps) {
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
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>Manage your vendor accounts</CardDescription>
        </div>
        <Button onClick={onAddNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
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
                  <TableHead onClick={() => handleSort('vendorNumber')} className="cursor-pointer">
                    <div className="flex items-center space-x-1">
                      <span>Vendor #</span>
                      {getSortIcon('vendorNumber')}
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
                      <span className="mt-2 block">Loading vendors...</span>
                    </TableCell>
                  </TableRow>
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="text-center text-muted-foreground">
                        <p>No vendors found</p>
                        <Button variant="link" onClick={onAddNew}>
                          Add your first vendor
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => (
                    <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell 
                        className="font-medium"
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        {vendor.vendorNumber}
                      </TableCell>
                      <TableCell 
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        {vendor.name}
                      </TableCell>
                      <TableCell 
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        {vendor.email || '-'}
                      </TableCell>
                      <TableCell 
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        {vendor.phone || '-'}
                      </TableCell>
                      <TableCell 
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        <Badge variant={vendor.isActive ? "success" : "secondary"}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell 
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        {formatDate(vendor.createdAt)}
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
                              onClick={() => onEdit(vendor.id)}
                              className="cursor-pointer"
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(vendor.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
          
          {vendors.length > 0 && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => page > 1 && onPageChange(page - 1)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => onPageChange(i + 1)} 
                      isActive={page === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => page < totalPages && onPageChange(page + 1)}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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