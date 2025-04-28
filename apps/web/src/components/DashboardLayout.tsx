'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname() || '';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Accounts', href: '/dashboard/accounts' },
    { name: 'Journal Entries', href: '/dashboard/journal-entries' },
    { name: 'Bills', href: '/dashboard/bills' },
    { name: 'Invoices', href: '/dashboard/invoices' },
    { name: 'Reports', href: '/dashboard/reports' },
    { name: 'Aggregated Data', href: '/dashboard/aggregated-data-example' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold">Qbit Accounting</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <div className="flex items-center justify-between h-16 bg-white border-b px-4 md:px-6">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <div className="ml-4 flex items-center md:ml-6">
            {/* User profile dropdown would go here */}
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="hidden md:inline-block text-sm">User Name</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
