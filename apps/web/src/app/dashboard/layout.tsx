'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/contexts/auth-context';

interface SidebarLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

const SidebarLink = ({ href, label, active }: SidebarLinkProps) => (
  <Link
    href={href}
    className={`block px-4 py-2 my-1 rounded transition ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
    }`}
  >
    {label}
  </Link>
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 flex flex-col">
          <div className="flex items-center justify-center p-4 border-b">
            <h1 className="font-bold text-xl text-blue-600">Qbit Accounting</h1>
          </div>
          
          <div className="flex-grow py-4">
            <SidebarLink href="/dashboard" label="Dashboard" />
            
            {/* General Ledger links */}
            <div className="border-t my-2 pt-2">
              <h3 className="font-semibold mb-2 text-gray-600">General Ledger</h3>
              <SidebarLink href="/dashboard/accounts" label="Chart of Accounts" />
              <SidebarLink href="/dashboard/journal-entries" label="Journal Entries" />
            </div>
            
            {/* Accounts Receivable links */}
            <div className="border-t my-2 pt-2">
              <h3 className="font-semibold mb-2 text-gray-600">Accounts Receivable</h3>
              <SidebarLink href="/dashboard/customers" label="Customers" />
              <SidebarLink href="/dashboard/invoices" label="Invoices" />
            </div>
            
            {/* Admin links - only show for admin users */}
            {user && user.roles && user.roles.includes('admin') && (
              <div className="border-t my-2 pt-2">
                <h3 className="font-semibold mb-2 text-gray-600">Administration</h3>
                <SidebarLink href="/dashboard/users" label="Users" />
                <SidebarLink href="/dashboard/roles" label="Roles" />
              </div>
            )}
          </div>
          
          <div className="border-t p-4">
            <div className="mb-2 text-sm text-gray-600">
              Signed in as: <span className="font-semibold">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow bg-gray-50 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
          </header>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 