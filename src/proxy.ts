import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRolePathFromNumber } from '@/lib/role-utils';

const PUBLIC_ROUTES = [
  '/',
  '/dashboard',
  '/about',
  '/auth/login',
  '/auth/register',
  '/auth/dean/login',
  '/auth/dean/register',
  '/auth/staff/login',
  '/auth/staff/register',
  '/auth/admin/login',
];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const roleStr = request.cookies.get('user-role')?.value;
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

  // If token is expired, clear it and redirect to main page with error flag
  if (isTokenExpired && !isPublic) {
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'session_expired');

    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-token');
    response.cookies.delete('user-role');
    response.cookies.delete('token-expiry');
    response.cookies.delete('user-id');
    return response;
  }

  // If it's a public route, allow access
  if (isPublic) {
    // If user is logged in and tries to access auth pages, redirect to their dashboard
    if (token && roleStr && !isTokenExpired && pathname.startsWith('/auth')) {
      const roleNum = parseInt(roleStr, 10);
      const rolePath = getRolePathFromNumber(roleNum);
      return NextResponse.redirect(new URL(`/page/${rolePath}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require valid authentication
  if (!token || !roleStr || isTokenExpired) {
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'unauthorized');

    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-token');
    response.cookies.delete('user-role');
    response.cookies.delete('token-expiry');
    response.cookies.delete('user-id');
    return response;
  }

  // Check if user is accessing their allowed role path
  const roleNum = parseInt(roleStr, 10);
  const userRolePath = getRolePathFromNumber(roleNum);

  // Extract role from pathname (e.g., /page/admin/dashboard -> admin)
  const pathMatch = pathname.match(/^\/page\/([^\/]+)/);
  const pathRole = pathMatch?.[1];

  // If accessing wrong role path, redirect to correct one
  if (pathRole && pathRole !== userRolePath) {
    // Extract the page they're trying to access (e.g., dashboard, calendar)
    const pageMatch = pathname.match(/^\/page\/[^\/]+\/(.+)/);
    const page = pageMatch?.[1] || 'dashboard';
    return NextResponse.redirect(new URL(`/page/${userRolePath}/${page}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)',
  ],
};