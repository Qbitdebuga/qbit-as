'use client';

import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'up' | 'down';
  message?: string;
}

export default function DebugPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      status: 'checking',
    },
    {
      name: 'Auth Service',
      url: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002',
      status: 'checking',
    },
    {
      name: 'General Ledger Service',
      url: process.env.NEXT_PUBLIC_GENERAL_LEDGER_URL || 'http://localhost:3003',
      status: 'checking',
    },
  ]);

  const [envVariables, setEnvVariables] = useState<{ [key: string]: string | undefined }>({});

  useEffect(() => {
    // Collect environment variables
    setEnvVariables({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
      NEXT_PUBLIC_GENERAL_LEDGER_URL: process.env.NEXT_PUBLIC_GENERAL_LEDGER_URL,
    });

    // Check each service
    const checkServices = async () => {
      const updatedServices = [...services];

      for (let i = 0; i < updatedServices.length; i++) {
        const service = updatedServices[i];
        try {
          const startTime = Date.now();

          // Check health endpoint if available, or just root path
          const healthUrl = `${service.url}${service.url.endsWith('/') ? '' : '/'}health`;
          const response = await fetch(healthUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Very short timeout to fail fast
            signal: AbortSignal.timeout(3000),
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            service.status = 'up';
            service.message = `Response time: ${responseTime}ms`;
          } else {
            service.status = 'down';
            service.message = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (error: any) {
          service.status = 'down';
          service.message = error.message || 'Unknown error';
        }

        // Update state after each service check
        setServices([...updatedServices]);
      }
    };

    checkServices();
  }, []);

  const retryChecks = () => {
    setServices(
      services.map((service) => ({
        ...service,
        status: 'checking',
        message: undefined,
      })),
    );

    // Force re-render to trigger the useEffect again
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Connectivity Diagnostics</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">{JSON.stringify(envVariables, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Service Status</h2>
          <button
            onClick={retryChecks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Checks
          </button>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.url}</p>
                </div>
                <div className="flex items-center">
                  {service.status === 'checking' ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Checking...</span>
                    </div>
                  ) : service.status === 'up' ? (
                    <div className="flex items-center text-green-600">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span>Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      <span>Unavailable</span>
                    </div>
                  )}
                </div>
              </div>
              {service.message && (
                <div
                  className={`mt-2 text-sm p-2 rounded ${service.status === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                >
                  {service.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>
            <strong>User Agent:</strong> {navigator.userAgent}
          </p>
          <p>
            <strong>Platform:</strong> {navigator.platform}
          </p>
          <p>
            <strong>Language:</strong> {navigator.language}
          </p>
          <p>
            <strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ensure all services are running correctly (check terminal windows for errors)</li>
          <li>Check that environment variables are properly configured</li>
          <li>Verify there are no network/firewall issues blocking connections</li>
          <li>Confirm that CORS is properly configured on backend services</li>
          <li>Check browser console for any additional errors</li>
        </ul>
      </div>
    </div>
  );
}
