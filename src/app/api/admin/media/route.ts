import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request: Request) {
  try {
    // Verificación de seguridad
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin_auth')?.value;
    if (authCookie !== (process.env.ADMIN_PIN || '2026')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`DELETE FROM event_media WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}