import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Public routes
  const isLoginPage = pathname === '/login';
  const isPublicRoute = isLoginPage || pathname === '/';

  // If user is on login page and has valid token, redirect to dashboard
  if (isLoginPage && token) {
    const decoded = verifyToken(token.value);
    if (decoded) {
      const dashboardPath = `/${decoded.role}`;
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Protected routes - require authentication
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token and check role-based access
  if (token && !isPublicRoute) {
    const decoded = verifyToken(token.value);
    
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Role-based route protection
    const role = decoded.role;
    
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    
    if (pathname.startsWith('/employee') && role !== 'employee') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    
    if (pathname.startsWith('/client') && role !== 'client') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};