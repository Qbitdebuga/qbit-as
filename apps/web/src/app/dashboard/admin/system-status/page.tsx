'use client';

import React from 'react';
import SystemStatus from '@/components/admin/SystemStatus';
import { NextPage } from 'next';

const SystemStatusPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Status Dashboard</h1>
        <p className="text-gray-600">Monitor the health and status of all services in the application.</p>
      </div>
      
      <SystemStatus />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">About Health Checks</h2>
        <p className="mb-3">
          This dashboard shows the real-time status of all microservices in the Qbit Accounting System. 
          Each service exposes health check endpoints that provide detailed information about their operational status.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Operational</span>
            </div>
            <p className="text-sm text-gray-600">
              The service is fully operational and all components are functioning correctly.
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="font-medium">Degraded</span>
            </div>
            <p className="text-sm text-gray-600">
              The service is operational but some components may be experiencing issues.
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-medium">Down</span>
            </div>
            <p className="text-sm text-gray-600">
              The service is not operational or is experiencing critical issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPage; 