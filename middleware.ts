import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('gp_token')?.value;
  const payload = token ? await verifyToken(token) : null;

  if (pathname.startsWith('/dashboard')) {
    if (!payload) return NextResponse.redirect(new URL('/', req.url));
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/portal', req.url));
  }

  if (pathname.startsWith('/portal')) {
    if (!payload) return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname === '/' && payload) {
    if (payload.role === 'admin') return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/portal/:path*'],
};