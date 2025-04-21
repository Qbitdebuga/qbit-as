'use client';

import { useAuthContext } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuthContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Overview</h2>
          <p className="text-gray-600">View your financial overview and key metrics.</p>
          <div className="mt-4">
            <button className="text-blue-600 hover:underline">View Details</button>
          </div>
        </div>
        
        {/* Invoices Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Invoices</h2>
          <p className="text-gray-600">Manage your customer invoices and payments.</p>
          <div className="mt-4">
            <button className="text-blue-600 hover:underline">View Invoices</button>
          </div>
        </div>
        
        {/* Journal Entries Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Journal Entries</h2>
          <p className="text-gray-600">Create and manage accounting journal entries.</p>
          <div className="mt-4">
            <button className="text-blue-600 hover:underline">View Journal</button>
          </div>
        </div>
        
        {/* Reports Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Reports</h2>
          <p className="text-gray-600">Access financial statements and reports.</p>
          <div className="mt-4">
            <button className="text-blue-600 hover:underline">View Reports</button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 