import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEV_MODE, PUBLIC_PATHS, isPublicPath, TOKEN_CONFIG } from '@qbit/auth-common';

// Simple middleware with centralized auth configuration
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
  const isAuthenticated = !!request.cookies.get(TOKEN_CONFIG.accessTokenKey)?.value;
  
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