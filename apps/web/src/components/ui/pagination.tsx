"use client";

import React from "react";
import { cn } from "./lib/utils";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

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
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust if we're at the end of the page range
  if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
      >
        Previous
      </button>
      
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "rounded-md px-2 py-1 text-sm",
            currentPage === page
              ? "bg-blue-600 text-white"
              : "border border-gray-300"
          )}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
} 