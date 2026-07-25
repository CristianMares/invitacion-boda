import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    const rows = await sql`SELECT key, value FROM event_config`;
    
    const configMap: Record<string, any> = {};
    rows.forEach(r => configMap[r.key] = r.value);

    return NextResponse.json({ success: true, config: configMap });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`
      INSERT INTO event_config (key, value) 
      VALUES (${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key) 
      DO UPDATE SET value = ${JSON.stringify(value)}::jsonb
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}