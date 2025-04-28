'use client';

import React, { useState } from 'react';
import { cn } from './lib/utils';

// Root component
interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('relative inline-block text-left', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            open,
            setOpen,
          });
        }
        return child;
      })}
    </div>
  );
}

// Trigger component
interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DropdownMenuTrigger({
  children,
  className,
  open,
  setOpen,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <div className={cn(className)} onClick={() => setOpen && setOpen(!open)} {...props}>
      {children}
    </div>
  );
}

// Content component
interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DropdownMenuContent({
  children,
  className,
  align = 'end',
  open,
  setOpen,
  ...props
}: DropdownMenuContentProps) {
  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen && setOpen(false)} />
      <div
        className={cn(
          'absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          alignClass[align],
          className,
        )}
        {...props}
      >
        <div className="py-1">{children}</div>
      </div>
    </>
  );
}

// Item component
interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm',
        destructive ? 'text-red-600' : 'text-gray-700',
        'hover:bg-gray-100 focus:bg-gray-100',
        className,
      )}
      {...props}
    />
  );
}

// Separator component
export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('my-1 h-px w-full bg-gray-200', className)} {...props} />;
}
