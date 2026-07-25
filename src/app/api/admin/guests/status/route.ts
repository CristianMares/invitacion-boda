import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return unauthorizedResponse();

  try {
    const { guestId, status } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    await sql`UPDATE guests SET status = ${status} WHERE id = ${guestId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al cambiar estado' }, { status: 500 });
  }
}