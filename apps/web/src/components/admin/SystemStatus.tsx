'use client';

import React, { useState, useEffect } from 'react';
import {
  useSystemStatus,
  ServiceHealth,
  HealthCheck,
  SystemStatusData,
} from '@/hooks/useSystemStatus';
import { formatDate } from '@/utils/format';

export const SystemStatus: React.FC = () => {
  const { loading, error, data, getServicesHealth, checkServiceHealth, refreshSystemStatus } =
    useSystemStatus();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSystemStatus();
    setRefreshing(false);
  };

  const toggleServiceDetails = (serviceName: string) => {
    if (expandedService === serviceName) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceName);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="text-red-500 font-medium mb-4">
          Failed to load system status: {error.message}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">System Status</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            Last updated: {data?.lastUpdated ? formatDate(new Date(data.lastUpdated)) : 'Never'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${getStatusColor(data?.overall || 'down')}`}></div>
        <span className="font-medium">
          Overall System Status:{' '}
          {data?.overall === 'up'
            ? 'Operational'
            : data?.overall === 'degraded'
              ? 'Partially Degraded'
              : 'Down'}
        </span>
      </div>

      <div className="space-y-4 mt-6">
        {data?.services.map((service) => (
          <div key={service.name} className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleServiceDetails(service.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${getStatusTextColor(service.status)}`}>
                  {getStatusLabel(service.status)}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${expandedService === service.name ? 'transform rotate-180' : ''}`}
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedService === service.name && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">URL</span>
                    <p className="font-mono text-sm">{service.url}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last Checked</span>
                    <p>{formatDate(new Date(service.lastChecked))}</p>
                  </div>
                  {service.details.version && (
                    <div>
                      <span className="text-sm text-gray-500">Version</span>
                      <p>{service.details.version}</p>
                    </div>
                  )}
                  {service.details.uptime !== undefined && (
                    <div>
                      <span className="text-sm text-gray-500">Uptime</span>
                      <p>{formatUptime(service.details.uptime)}</p>
                    </div>
                  )}
                </div>

                <h4 className="font-medium mb-2 mt-4">Health Checks</h4>
                <div className="space-y-2">
                  {service.details.checks.map((check, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(check.status)}`}
                          ></div>
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <span className={`text-xs ${getStatusTextColor(check.status)}`}>
                          {getStatusLabel(check.status)}
                        </span>
                      </div>
                      {check.details && Object.keys(check.details).length > 0 && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {service.details.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
                    <div className="font-medium mb-1">Error</div>
                    <div className="font-mono text-xs">{service.details.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {(!data || data.services.length === 0) && !loading && (
        <div className="text-center p-8 text-gray-500">No services data available</div>
      )}
    </div>
  );
};

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'up':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'down':
    default:
      return 'bg-red-500';
  }
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case 'up':
      return 'text-green-600';
    case 'degraded':
      return 'text-yellow-600';
    case 'down':
    default:
      return 'text-red-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'up':
      return 'Operational';
    case 'degraded':
      return 'Degraded';
    case 'down':
    default:
      return 'Down';
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default SystemStatus;
