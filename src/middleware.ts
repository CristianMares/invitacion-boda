import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas de administración, excluyendo la página de login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authCookie = request.cookies.get('admin_auth')?.value;
    const adminPin = process.env.ADMIN_PIN || '2026';

    if (authCookie !== adminPin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
