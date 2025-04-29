import { redirect } from 'next/navigation';

/**
 * Navigation utility functions to handle redirects consistently across the application
 */

/**
 * Client-side navigation function to handle redirects
 * @param path Path to navigate to
 * @param options Options for navigation
 */
export const navigateTo = (
  path: string,
  options: {
    replace?: boolean;
    external?: boolean;
  } = {}
) => {
  const { replace = false, external = false } = options;
  
  // For external links or when we need a full page refresh
  if (external) {
    if (replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
    return;
  }
  
  // For client-side navigation within the app
  // We're using window.location for now since we need consistent behavior
  // This ensures a clean navigation that works in all contexts
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.href = path;
  }
};

/**
 * Server-side navigation function (for server components)
 * @param path Path to redirect to
 */
export const redirectTo = (path: string) => {
  redirect(path);
};

/**
 * Navigation paths used in the application
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/dashboard/accounts',
  JOURNAL_ENTRIES: '/dashboard/journal-entries',
  CUSTOMERS: '/dashboard/customers',
  INVOICES: '/dashboard/invoices',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
}; 