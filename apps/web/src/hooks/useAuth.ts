'use client';

import { useState, useEffect } from 'react';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = async () => {
      try {
        // In a real app, you would validate the token with your backend
        const token = localStorage.getItem('auth_token');
        if (token) {
          // For demo purposes, we're just checking if the token exists
          setIsAuthenticated(true);
          // Mock user data
          setUser({ id: '1', email: 'user@example.com' });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call to your auth endpoint
      // For demo purposes, we'll just mock a successful login
      
      // Mock successful login
      const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
      localStorage.setItem('auth_token', mockToken);
      
      setIsAuthenticated(true);
      setUser({ id: '1', email });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
} 