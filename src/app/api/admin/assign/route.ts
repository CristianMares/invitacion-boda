import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { personId, type, tableId } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

    if (type === 'guest') {
      await sql`UPDATE guests SET table_id = ${tableId} WHERE id = ${personId}`;
    } else if (type === 'companion') {
      await sql`UPDATE companions SET table_id = ${tableId} WHERE id = ${personId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error asignando asiento' }, { status: 500 });
  }
}