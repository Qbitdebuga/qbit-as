// API client utilities for the frontend application

// Base URL from environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to get the authorization header
export const getAuthHeader = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch with authentication
export const apiFetch = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
    ...getAuthHeader()
  });

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}; 