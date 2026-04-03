import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('gp_token')?.value;
  const payload = token ? verifyToken(token) : null;

  // Protect dashboard (admin only)
  if (pathname.startsWith('/dashboard')) {
    if (!payload) return NextResponse.redirect(new URL('/', req.url));
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/portal', req.url));
  }

  // Protect portal (any logged-in user)
  if (pathname.startsWith('/portal')) {
    if (!payload) return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect logged-in users away from login page
  if (pathname === '/' && payload) {
    if (payload.role === 'admin') return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/portal/:path*'],
};
