import { neon } from '@neondatabase/serverless';
import { LayoutDashboard } from 'lucide-react';
import SeatingPlanUI from '@/components/SeatingPlanUI';

export const dynamic = 'force-dynamic';

export default async function AdminMesas() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  const tables = await sql`SELECT * FROM tables ORDER BY table_number ASC`;
  const decorations = await sql`SELECT * FROM decorations`;

  const guests = await sql`
    SELECT id, full_name as name, 'guest' as type, table_id, id as group_id 
    FROM guests 
    WHERE status IN ('approved', 'confirmed')
  `;

  const companions = await sql`
    SELECT c.id, c.full_name as name, 'companion' as type, c.table_id, c.guest_id as group_id
    FROM companions c
    JOIN guests g ON c.guest_id = g.id
    WHERE g.status IN ('approved', 'confirmed')
  `;

  const allPeople = [...guests, ...companions];

  return (
    <div className="h-full bg-black text-white p-4 md:p-8 font-sans flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-white">Asignación de Asientos</h1>
          <p className="text-neutral-500 text-xs mt-1">Arrastra grupos o personas hacia las mesas del croquis.</p>
        </div>
        <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
          <LayoutDashboard className="text-amber-500" size={16} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Seating Plan</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        <SeatingPlanUI initialPeople={allPeople as any} tables={tables as any} decorations={decorations as any} />
      </div>
    </div>
  );
}