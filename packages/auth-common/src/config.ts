/**
 * Centralized Authentication Configuration
 * 
 * This file serves as the single source of truth for all authentication-related
 * configuration across the application. All auth settings should be defined here.
 */

// Development mode flag - enables bypass of authentication for development
export const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

// Base URL for authentication endpoints
export const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3010';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  login: `${AUTH_API_BASE_URL}/api/auth/login`,
  register: `${AUTH_API_BASE_URL}/api/auth/register`,
  profile: `${AUTH_API_BASE_URL}/api/auth/profile`,
  refresh: `${AUTH_API_BASE_URL}/api/auth/refresh`,
  logout: `${AUTH_API_BASE_URL}/api/auth/logout`,
  forgotPassword: `${AUTH_API_BASE_URL}/api/auth/forgot-password`,
  resetPassword: `${AUTH_API_BASE_URL}/api/auth/reset-password`,
};

// Token settings
export const TOKEN_CONFIG = {
  accessTokenKey: 'qbit_access_token',
  refreshTokenKey: 'qbit_refresh_token',
  userKey: 'qbit_user',
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes in milliseconds
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Public paths that don't require authentication
export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Simple path matching helper
export const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/reset-password/')
  );
};

// Export all config settings
export const AUTH_CONFIG = {
  DEV_MODE,
  AUTH_API_BASE_URL,
  AUTH_ENDPOINTS,
  TOKEN_CONFIG,
  PUBLIC_PATHS,
  isPublicPath,
};

export default AUTH_CONFIG; 