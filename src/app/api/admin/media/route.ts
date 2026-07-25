import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`DELETE FROM event_media WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`UPDATE event_media SET is_approved = true WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al aprobar' }, { status: 500 });
  }
}