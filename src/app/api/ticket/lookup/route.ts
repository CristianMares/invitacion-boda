import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ success: false, error: 'Código requerido' }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    // Busca por número de teléfono o prefijo de ID
    const rows = await sql`
      SELECT id FROM guests 
      WHERE phone LIKE ${'%' + code + '%'} OR id::text LIKE ${code + '%'}
      LIMIT 1
    `;

    if (rows.length > 0) {
      return NextResponse.json({ success: true, guestId: rows[0].id });
    }
    return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}