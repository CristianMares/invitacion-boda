import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth')?.value;
  const adminPin = process.env.ADMIN_PIN;
  return authCookie === adminPin;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
}