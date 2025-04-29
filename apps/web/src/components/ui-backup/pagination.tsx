"use client";

import React from "react";
import { cn } from "./lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Ensure currentPage is valid
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Calculate the range of pages to display
  const maxVisiblePages = 5;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);
  
  let startPage = Math.max(1, currentPage - halfVisiblePages);
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust startPage if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Generate array of page numbers to display
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <button
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          currentPage === 1 && "opacity-50 pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous Page</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      {startPage > 1 && (
        <>
          <button
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          )}
        </>
      )}
      
      {pages.map((page) => (
        <button
          key={page}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            page === currentPage && "bg-accent text-accent-foreground"
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          )}
          <button
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          currentPage === totalPages && "opacity-50 pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next Page</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
} 