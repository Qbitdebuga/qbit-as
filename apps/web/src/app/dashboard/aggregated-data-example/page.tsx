'use client';

import React from 'react';
import AggregatedDataExample from '../../../components/AggregatedDataExample';
import DashboardLayout from '../../../components/DashboardLayout';

export default function AggregatedDataPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Aggregated Data Example</h1>
        <p className="mb-6 text-gray-600">
          This page demonstrates how to use the useAggregatedData hook to fetch and display data from multiple microservices.
        </p>
        
        <AggregatedDataExample />
      </div>
    </DashboardLayout>
  );
} 