'use client';

import { ReactNode } from 'react';

interface DashboardHeaderProps {
  title?: string;
  currentDate?: string;
  children?: ReactNode;
}

export function DashboardHeader({ 
  title = 'Dashboard', 
  currentDate, 
  children 
}: DashboardHeaderProps) {
  return (
    <header 
      className="bg-white shadow-sm p-4 flex justify-between items-center" 
      suppressHydrationWarning
    >
      <h1 className="text-2xl font-semibold">{title}</h1>
      
      <div className="flex items-center gap-4">
        {children}
        
        {currentDate && (
          <div className="text-gray-600">
            {currentDate}
          </div>
        )}
      </div>
    </header>
  );
} 