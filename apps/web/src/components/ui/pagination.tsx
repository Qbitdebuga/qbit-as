'use client';

import * as React from 'react';
import { cn } from './lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationContext = React.createContext<{ currentPage: number; totalPages: number }>({
  currentPage: 1,
  totalPages: 1,
});

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface PaginationContentProps extends React.HTMLAttributes<HTMLUListElement> {}

interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {
  active?: boolean;
}

interface PaginationLinkProps extends React.ComponentProps<'button'> {
  isActive?: boolean;
}

interface PaginationPreviousProps extends PaginationLinkProps {}

interface PaginationNextProps extends PaginationLinkProps {}

export function Pagination({
  className,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  ...props
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];

  // Create array of page numbers to display (show 5 pages at a time)
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust if we're at the end of the page range
  if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationContext.Provider value={{ currentPage, totalPages }}>
      <div className={cn('flex items-center justify-center', className)} {...props}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {pageNumbers.map((page) => (
            <PaginationItem key={page} active={currentPage === page}>
              <PaginationLink onClick={() => onPageChange(page)} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </PaginationContext.Provider>
  );
}

export function PaginationContent({ className, ...props }: PaginationContentProps) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

export function PaginationItem({ className, active, ...props }: PaginationItemProps) {
  return <li className={cn('', className)} {...props} />;
}

export function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <button
      className={cn(
        'flex h-9 min-w-9 items-center justify-center rounded-md text-sm font-medium',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-background text-foreground hover:bg-muted hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: PaginationPreviousProps) {
  return (
    <button
      className={cn(
        'flex h-9 items-center gap-1 pr-2 pl-2.5 rounded-md text-sm font-medium bg-background text-foreground hover:bg-muted hover:text-accent-foreground disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </button>
  );
}

export function PaginationNext({ className, ...props }: PaginationNextProps) {
  return (
    <button
      className={cn(
        'flex h-9 items-center gap-1 pl-2 pr-2.5 rounded-md text-sm font-medium bg-background text-foreground hover:bg-muted hover:text-accent-foreground disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
