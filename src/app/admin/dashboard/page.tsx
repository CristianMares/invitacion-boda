import { neon } from '@neondatabase/serverless';
import AdminDashboardInteractiveMap from '@/components/AdminDashboardInteractiveMap';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  const metrics = await sql`
    SELECT 
      COUNT(*) as total_requests,
      SUM(tickets_requested) FILTER (WHERE status = 'approved') as total_approved_pases,
      SUM(tickets_requested) FILTER (WHERE has_entered = true) as total_checked_in
    FROM guests
  `;

  const tables = await sql`SELECT * FROM tables ORDER BY table_number ASC`;
  const decorations = await sql`SELECT * FROM decorations ORDER BY COALESCE(z_index, 10) ASC`;

  // Asignados (Planificación)
  const assignedGuests = await sql`SELECT table_id, COUNT(*) as cnt FROM guests WHERE table_id IS NOT NULL GROUP BY table_id`;
  const assignedCompanions = await sql`SELECT table_id, COUNT(*) as cnt FROM companions WHERE table_id IS NOT NULL GROUP BY table_id`;

  // En Salón (Check-in Real)
  const enteredGuests = await sql`SELECT table_id, COUNT(*) as cnt FROM guests WHERE table_id IS NOT NULL AND has_entered = true GROUP BY table_id`;
  const enteredCompanions = await sql`
    SELECT c.table_id, COUNT(*) as cnt 
    FROM companions c 
    JOIN guests g ON c.guest_id = g.id 
    WHERE c.table_id IS NOT NULL AND g.has_entered = true 
    GROUP BY c.table_id
  `;

  const assignedMap: Record<string, number> = {};
  assignedGuests.forEach(r => assignedMap[r.table_id] = Number(r.cnt));
  assignedCompanions.forEach(r => { assignedMap[r.table_id] = (assignedMap[r.table_id] || 0) + Number(r.cnt); });

  const enteredMap: Record<string, number> = {};
  enteredGuests.forEach(r => enteredMap[r.table_id] = Number(r.cnt));
  enteredCompanions.forEach(r => { enteredMap[r.table_id] = (enteredMap[r.table_id] || 0) + Number(r.cnt); });

  const stats = metrics[0];
  const totalApproved = stats.total_approved_pases || 0;
  const totalCheckedIn = stats.total_checked_in || 0;
  const percentage = totalApproved > 0 ? Math.round((totalCheckedIn / totalApproved) * 100) : 0;

  return (
    <div className="h-full bg-black text-white p-4 md:p-8 font-sans overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">Command Center</h1>
            <p className="text-emerald-500 text-xs mt-1 font-mono animate-pulse">● Monitor en Vivo</p>
          </div>
        </div>

        {/* METRICAS CLAVE */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-950 border border-white/10 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Pases Aprobados</p>
            <p className="text-4xl font-serif text-white mt-1">{totalApproved}</p>
          </div>
          <div className="bg-neutral-950 border border-emerald-500/30 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Personas en Salón (Check-in)</p>
            <p className="text-4xl font-serif text-emerald-400 mt-1">{totalCheckedIn}</p>
          </div>
          <div className="bg-neutral-950 border border-white/10 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Porcentaje de Asistencia</p>
            <p className="text-4xl font-serif text-white mt-1">{percentage}%</p>
          </div>
        </div>

        {/* SIMBOLOGÍA E LEYENDA */}
        <div className="flex flex-wrap gap-6 items-center justify-center bg-neutral-950/80 p-4 rounded-2xl border border-white/5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white border border-[#D4C4B7]" />
            <span>Mesa Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#8C6239] border border-[#4A3320]" />
            <span>Asignada (Plan)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span>Presente en Salón</span>
          </div>
        </div>

        {/* MAPA INTERACTIVO */}
        <AdminDashboardInteractiveMap tables={tables as any} decorations={decorations as any} assignedMap={assignedMap} enteredMap={enteredMap} />
      </div>
    </div>
  );
}