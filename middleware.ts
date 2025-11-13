// middleware.ts (root of Next.js project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register', 
  '/auth/faculty/register',
  '/auth/faculty/login',
  '/auth/staff/register',
  '/auth/staff/login',
  '/auth/admin/login'
];

const ROLE_DASHBOARDS: Record<string, string> = {
  '2': '/pages/faculty/dashboard',
  '3': '/pages/staff/dashboard',
  '4': '/pages/admin/dashboard',
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  // Allow access to public routes
  if (isPublicRoute) {
    // If user has token and tries to access auth pages, redirect to role-specific dashboard
    if (token && userRole) {
      const dashboardUrl = ROLE_DASHBOARDS[userRole];
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }
  
  // Protect all other routes - require token
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)',
  ],
};