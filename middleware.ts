import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/faculty/login',
  '/auth/faculty/register',
  '/auth/staff/login',
  '/auth/staff/register',
  '/auth/admin/login',
];

const ROLE_DASHBOARDS = {
  "2": "/page/faculty/dashboard",
  "3": "/page/staff/dashboard",
  "4": "/page/admin/dashboard",
};

const ROLE_ROOTS = {
  "2": "/page/faculty",
  "3": "/page/staff",
  "4": "/page/admin",
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const role = request.cookies.get('user-role')?.value;
  const tokenExpiry = request.cookies.get('token-expiry')?.value;
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublic = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Check if token has expired
  const isTokenExpired = tokenExpiry ? new Date(tokenExpiry) <= new Date() : false;

  // If token is expired, clear it and redirect to main page
  if (isTokenExpired && !isPublic) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth-token');
    response.cookies.delete('user-role');
    response.cookies.delete('token-expiry');
    return response;
  }

  // If it's a public route, allow access
  if (isPublic) {
    // If user is logged in and tries to access auth pages, redirect to their dashboard
    if (token && role && !isTokenExpired && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS], request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require valid authentication
  if (!token || !role || isTokenExpired) {
    const response = NextResponse.redirect(new URL('/', request.url));
    // Clear expired/invalid tokens
    response.cookies.delete('auth-token');
    response.cookies.delete('user-role');
    response.cookies.delete('token-expiry');
    return response;
  }

  // Check if user is accessing their allowed role path
  const allowedRoot = ROLE_ROOTS[role as keyof typeof ROLE_ROOTS];
  if (!pathname.startsWith(allowedRoot)) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)',
  ],
};