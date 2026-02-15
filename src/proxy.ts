import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRolePathFromNumber } from '@/core/lib/role-utils';

const PUBLIC_ROUTES = [
  '/',
  '/dashboard',
  '/about',
  '/login',
  '/register',
  '/dean/login',
  '/dean/register',
  '/staff/login',
  '/staff/register',
  '/admin/login',
];

// ⚡ PERFORMANCE: Cache role path lookups to avoid repeated parsing
const rolePathCache = new Map<number, string>();

const getCachedRolePath = (roleNum: number): string => {
  if (!rolePathCache.has(roleNum)) {
    rolePathCache.set(roleNum, getRolePathFromNumber(roleNum));
  }
  return rolePathCache.get(roleNum)!;
};

export function proxy(request: NextRequest) {
  // ⚡ PERFORMANCE: Cache cookie access (read once instead of multiple times)
  const cookies = {
    token: request.cookies.get('auth-token')?.value,
    roleStr: request.cookies.get('user-role')?.value,
    tokenExpiry: request.cookies.get('token-expiry')?.value,
  };

  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublic = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Check if token has expired
  const isTokenExpired = cookies.tokenExpiry ? new Date(cookies.tokenExpiry) <= new Date() : false;

  // If token is expired, clear it and redirect to main page with error flag
  if (isTokenExpired && !isPublic) {
    // ⚡ PERFORMANCE: Reuse URL object instead of creating multiple
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
    if (cookies.token && cookies.roleStr && !isTokenExpired && (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/dean') || pathname.startsWith('/staff') || pathname.startsWith('/admin/login'))) {
      const roleNum = parseInt(cookies.roleStr, 10);
      // ⚡ PERFORMANCE: Use cached role path lookup
      const rolePath = getCachedRolePath(roleNum);
      return NextResponse.redirect(new URL(`/${rolePath}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require valid authentication
  if (!cookies.token || !cookies.roleStr || isTokenExpired) {
    // ⚡ PERFORMANCE: Reuse URL object
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
  const roleNum = parseInt(cookies.roleStr, 10);
  // ⚡ PERFORMANCE: Use cached role path lookup
  const userRolePath = getCachedRolePath(roleNum);

  // Extract role from pathname (e.g., /admin/dashboard -> admin)
  const pathMatch = pathname.match(/^\/([^\/]+)/);
  const pathRole = pathMatch?.[1];

  // If accessing wrong role path, redirect to correct one
  if (pathRole && pathRole !== userRolePath && ['dean', 'staff', 'admin'].includes(pathRole)) {
    // Extract the page they're trying to access (e.g., dashboard, calendar)
    const pageMatch = pathname.match(/^\/[^\/]+\/(.+)/);
    const page = pageMatch?.[1] || 'dashboard';
    return NextResponse.redirect(new URL(`/${userRolePath}/${page}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)',
  ],
};