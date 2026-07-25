import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isAdminRoute || isAdminApiRoute) {
    const authCookie = request.cookies.get('admin_auth')?.value;
    const adminPin = process.env.ADMIN_PIN || '2026';

    if (authCookie !== adminPin) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};