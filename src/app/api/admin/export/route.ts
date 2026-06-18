import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Validación de seguridad (Bearer Token)
  const authHeader = request.headers.get('authorization');
  const adminPin = process.env.ADMIN_PIN || '2026';
  
  if (authHeader !== `Bearer ${adminPin}`) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    // Extraer solo invitados aprobados y confirmados con sus acompañantes
    const rows = await sql`
      SELECT 
        g.id, g.full_name, g.phone, g.tickets_requested, g.status,
        COALESCE(
          json_agg(
            json_build_object('name', c.full_name, 'desc', c.description)
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as companions
      FROM guests g
      LEFT JOIN companions c ON g.id = c.guest_id
      WHERE g.status IN ('approved', 'confirmed')
      GROUP BY g.id
    `;

    // Formatear datos para el bot de WhatsApp
    const exportData = rows.map(row => ({
      ticket_url: `https://${request.headers.get('host')}/ticket/${row.id}`,
      phone: row.phone,
      titular: row.full_name,
      total_pases: row.tickets_requested,
      status: row.status,
      acompaniantes: row.companions
    }));

    return NextResponse.json({ success: true, count: exportData.length, data: exportData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error de extracción de datos' }, { status: 500 });
  }
}