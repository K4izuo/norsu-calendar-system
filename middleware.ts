// middleware.ts (root of Next.js project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { UserRole } from './utils/role-colors';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/faculty/login',
  '/auth/faculty/register',
  '/auth/staff/login',
  '/auth/staff/register',
  '/auth/admin/login',
];

const ROLE_DASHBOARDS = {
  "2": "/pages/faculty/dashboard/",
  "3": "/pages/staff/dashboard/",
  "4": "/pages/admin/dashboard/",
};

const ROLE_ROOTS = {
  "2": "/pages/faculty/",
  "3": "/pages/staff/",
  "4": "/pages/admin/",
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const role = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    if (token && role) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS], request.url));
    }
    return NextResponse.next();
  }

  if (!token || !role) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

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