import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fullName, phone, ticketsRequested, companions } = await request.json();
    
    if (!fullName || !phone) {
      return NextResponse.json({ success: false, error: 'Faltan datos del titular' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    // 1. Insertar Titular y retornar su ID
    const guestResult = await sql`
      INSERT INTO guests (full_name, phone, tickets_requested) 
      VALUES (${fullName.trim()}, ${phone.trim()}, ${Number(ticketsRequested)})
      RETURNING id
    `;
    
    const guestId = guestResult[0].id;

    // 2. Insertar Acompañantes si existen
    if (companions && companions.length > 0) {
      for (const comp of companions) {
        await sql`
          INSERT INTO companions (guest_id, full_name, description)
          VALUES (${guestId}, ${comp.fullName.trim()}, ${comp.description.trim() || null})
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}