// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Faqat aniq himoyalangan yo'llar (/ emas!)
const PROTECTED_PATHS = ['/chat', '/games', '/settings'];
const AUTH_PATHS = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kayumov_auth_token')?.value;
  const user = token ? verifyToken(token) : null;

  // Dashboard root sahifasini himoya qilish
  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
  }

  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
  }

  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (user) return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};