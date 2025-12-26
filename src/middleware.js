import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';
  const isPublicRoute = isLoginPage || pathname === '/';

  // Logged-in user visiting login page
  if (isLoginPage && token) {
    console.log(request.url)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log(token)
  // Protect private routes
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
