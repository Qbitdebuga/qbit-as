import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // This is a placeholder - in a real app, you would fetch from your API
        // const response = await fetch('/api/customers');
        // const data = await response.json();
        
        // For now, we'll use mock data
        const mockCustomers = [
          { id: '1', name: 'Acme Corp', email: 'contact@acmecorp.com', phone: '555-123-4567' },
          { id: '2', name: 'Globex Industries', email: 'info@globex.com', phone: '555-765-4321' },
          { id: '3', name: 'ABC Enterprises', email: 'sales@abcent.com', phone: '555-987-6543' }
        ];
        
        setCustomers(mockCustomers);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    // Placeholder for API call
    // const response = await fetch('/api/customers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(customer)
    // });
    // const newCustomer = await response.json();
    
    // Mock implementation
    const newCustomer = {
      id: String(Date.now()),
      ...customer
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  return { customers, loading, error, addCustomer };
} 