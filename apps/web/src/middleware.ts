import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Development mode: true to bypass authentication checks
const DEV_MODE = true;

// Paths that don't require authentication
const PUBLIC_PATHS = [
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
const isPublicPath = (path: string) => {
  return PUBLIC_PATHS.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/reset-password/')
  );
};

// Very simple middleware with no redirection logic in dev mode
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip for static assets
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Log only when useful for debugging
  if (DEV_MODE && (pathname === '/dashboard' || pathname === '/login')) {
    console.log(`[Middleware] DEV MODE - Skipping auth check for ${pathname}`);
  }
  
  // In dev mode, all middleware just passes through
  if (DEV_MODE) {
    return NextResponse.next();
  }
  
  // Production mode logic - only executed when DEV_MODE is false
  const isAuthenticated = !!request.cookies.get('qbit_access_token')?.value;
  
  // Case 1: Public path - always allow
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Case 2: Protected path but not authenticated - redirect to login
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }
  
  // Case 3: Everything else - the user is authenticated and trying to access a protected route
  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    // Match all routes except for static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 