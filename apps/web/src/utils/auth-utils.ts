'use client';

import { UserDto as User } from '@qbit/shared-types';
import { authClient } from './auth';

/**
 * Helper functions for authentication in the frontend
 */

/**
 * Check if the current user has the specified role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if the current user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Check if the current user has all of the specified roles
 */
export function hasAllRoles(user: User | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  return roles.every((role) => user.roles.includes(role));
}

/**
 * Get user's display name (fallback to email if name is not available)
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.name || (user.email ? user.email.split('@')[0] : 'User');
}

/**
 * Get user's initials for avatar placeholder
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?';

  if (user.name) {
    // Extract initials from name (first letter of first name + first letter of last name)
    const nameParts = user.name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
      const firstInitial = nameParts[0][0];
      const lastInitial = nameParts[nameParts.length - 1][0];
      if (firstInitial && lastInitial) {
        return (firstInitial + lastInitial).toUpperCase();
      }
    }
    // Handle single name or empty name parts
    return user.name[0]?.toUpperCase() || '?';
  }

  // Fallback to first letter of email
  return user.email && user.email[0] ? user.email[0].toUpperCase() : '?';
}

/**
 * Handle authentication error (typically 401)
 * Redirects to login page if needed and handles session expiration
 */
export async function handleAuthError(error: any): Promise<void> {
  console.error('Authentication error:', error);

  // If we're running in the browser
  if (typeof window !== 'undefined') {
    try {
      // Try to refresh the token first
      await authClient.refreshToken();
      // If successful, no further action needed
    } catch (refreshError) {
      // If refresh fails, redirect to login
      window.location.href = '/login?error=session_expired';
    }
  }
}

/**
 * Get navigation menu items based on user roles
 */
export function getAuthorizedMenuItems(
  user: User | null,
): Array<{ title: string; href: string; icon?: string }> {
  const baseMenuItems = [{ title: 'Dashboard', href: '/dashboard', icon: 'dashboard' }];

  if (!user) return baseMenuItems;

  // Add role-specific menu items
  if (hasRole(user, 'admin')) {
    baseMenuItems.push(
      { title: 'Users', href: '/dashboard/users', icon: 'users' },
      { title: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    );
  }

  if (hasAnyRole(user, ['accountant', 'admin'])) {
    baseMenuItems.push(
      { title: 'Chart of Accounts', href: '/dashboard/accounts', icon: 'accounts' },
      { title: 'Journal Entries', href: '/dashboard/journal-entries', icon: 'journal' },
      { title: 'Financial Reports', href: '/dashboard/reports', icon: 'reports' },
    );
  }

  if (hasAnyRole(user, ['sales', 'admin'])) {
    baseMenuItems.push(
      { title: 'Customers', href: '/dashboard/customers', icon: 'customers' },
      { title: 'Invoices', href: '/dashboard/invoices', icon: 'invoices' },
    );
  }

  if (hasAnyRole(user, ['purchasing', 'admin'])) {
    baseMenuItems.push(
      { title: 'Vendors', href: '/dashboard/vendors', icon: 'vendors' },
      { title: 'Bills', href: '/dashboard/bills', icon: 'bills' },
    );
  }

  return baseMenuItems;
}
