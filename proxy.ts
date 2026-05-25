  // proxy.ts

  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  import { verifyTokenEdge } from '@/lib/auth-edge';

  const PROTECTED_PATHS = ['/chat', '/games', '/settings'];
  const AUTH_PATHS = ['/login', '/signup'];

  export async function proxy(request: NextRequest) { // ✅ proxy — o'zgartirmang
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    const token = request.cookies.get('kayumov_auth_token')?.value;
    const user = token ? await verifyTokenEdge(token) : null;

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
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  };