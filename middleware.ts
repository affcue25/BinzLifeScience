import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'binz_admin';

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is not set');
    return new TextEncoder().encode('dev-only-insecure-secret-change-me-before-deploying');
  }
  return new TextEncoder().encode(s);
}

// First line of defence only. Every admin page and server action also calls requireAdmin().
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

  let signedIn = false;
  const token = req.cookies.get(COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, secret());
      signedIn = true;
    } catch {
      signedIn = false;
    }
  }

  if (pathname.startsWith('/api/')) {
    if (!signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.next();
  }

  if (!signedIn && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
