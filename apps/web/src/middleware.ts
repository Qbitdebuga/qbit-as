import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Check if current path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/reset-password/')
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip authentication check for static assets and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Get access token from cookies
  const accessToken = request.cookies.get('qbit_access_token')?.value;
  
  // Check if authenticated
  const isAuthenticated = !!accessToken;
  
  // If trying to access protected route while not logged in
  if (!isPublicPath(pathname) && !isAuthenticated) {
    console.log(`[Middleware] Redirecting to login: Not authenticated for path ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    
    // Store the intended destination for post-login redirect
    if (pathname !== '/dashboard') {
      url.searchParams.set('redirectTo', pathname);
    }
    
    return NextResponse.redirect(url);
  }
  
  // If trying to access login/register/etc. while logged in
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    console.log(`[Middleware] Redirecting to dashboard: Already authenticated for path ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    // Match all routes except for static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 