import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`UPDATE guests SET has_entered = true WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error Check-in' }, { status: 500 });
  }
}