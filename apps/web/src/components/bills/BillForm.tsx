'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface BillFormProps {
  onSave: (data: any) => void;
}

const BillForm: React.FC<BillFormProps> = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <p className="text-center py-8">This is a placeholder for the bill form.</p>
      <div className="flex justify-end">
        <Button onClick={() => onSave({ test: 'data' })}>Save Bill</Button>
      </div>
    </div>
  );
};

export default BillForm;