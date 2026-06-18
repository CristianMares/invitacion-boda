import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    // Incremento atómico para evitar race conditions
    const result = await sql`
      UPDATE event_media 
      SET likes = likes + 1 
      WHERE id = ${id} 
      RETURNING likes
    `;

    return NextResponse.json({ success: true, likes: result[0].likes });
  } catch (error) {
    return NextResponse.json({ error: 'Fallo al procesar reacción' }, { status: 500 });
  }
}