import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    const tables = await sql`SELECT * FROM tables ORDER BY table_number ASC`;
    const decorations = await sql`SELECT * FROM decorations`;
    return NextResponse.json({ success: true, tables, decorations });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching layout' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tables, decorations } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

    // 1. Guardar Mesas
    for (const t of tables) {
      await sql`
        INSERT INTO tables (id, table_number, pos_x, pos_y, capacity)
        VALUES (${t.id}, ${t.table_number}, ${t.pos_x}, ${t.pos_y}, ${t.capacity})
        ON CONFLICT (table_number) 
        DO UPDATE SET pos_x = ${t.pos_x}, pos_y = ${t.pos_y}, capacity = ${t.capacity}
      `;
    }
    if (tables.length > 0) {
      const tIds = tables.map((t: any) => t.id);
      await sql`DELETE FROM tables WHERE id != ALL(${tIds})`;
    } else {
      await sql`DELETE FROM tables`;
    }

    // 2. Guardar Decoraciones
    await sql`DELETE FROM decorations`; // Limpieza total y reescritura para evitar conflictos
    for (const d of decorations) {
      await sql`
        INSERT INTO decorations (id, type, label, pos_x, pos_y, width, height)
        VALUES (${d.id}, ${d.type}, ${d.label}, ${d.pos_x}, ${d.pos_y}, ${d.width}, ${d.height})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving layout' }, { status: 500 });
  }
}