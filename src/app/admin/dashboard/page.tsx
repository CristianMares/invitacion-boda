import { neon } from '@neondatabase/serverless';
import { Users, UserCheck, ShieldCheck } from 'lucide-react';

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

  const tables = await sql`SELECT * FROM tables`;
  const decorations = await sql`SELECT * FROM decorations`;

  const guestsOccupancy = await sql`SELECT table_id, COUNT(*) as cnt FROM guests WHERE table_id IS NOT NULL GROUP BY table_id`;
  const companionsOccupancy = await sql`SELECT table_id, COUNT(*) as cnt FROM companions WHERE table_id IS NOT NULL GROUP BY table_id`;

  const occupancyMap: Record<string, number> = {};
  guestsOccupancy.forEach(r => occupancyMap[r.table_id] = Number(r.cnt));
  companionsOccupancy.forEach(r => { occupancyMap[r.table_id] = (occupancyMap[r.table_id] || 0) + Number(r.cnt); });

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
            <p className="text-emerald-500 text-xs mt-1 font-mono animate-pulse">● En vivo</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-950 border border-white/10 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Pases Aprobados</p>
            <p className="text-4xl font-serif text-white mt-1">{totalApproved}</p>
          </div>
          <div className="bg-neutral-950 border border-emerald-500/30 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Check-ins</p>
            <p className="text-4xl font-serif text-emerald-400 mt-1">{totalCheckedIn}</p>
          </div>
          <div className="bg-neutral-950 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Asistencia</p>
              <p className="text-4xl font-serif text-white mt-1">{percentage}%</p>
            </div>
          </div>
        </div>

        <div className="w-full aspect-[16/10] max-w-5xl mx-auto bg-neutral-950 border-2 border-neutral-900 rounded-3xl relative shadow-2xl overflow-hidden mt-8">
          {decorations.map(d => (
            <div key={d.id} className="absolute bg-[#111] border-2 border-neutral-800/50 rounded-lg flex items-center justify-center"
                 style={{ left: `${d.pos_x}%`, top: `${d.pos_y}%`, transform: 'translate(-50%, -50%)', width: `${d.width}%`, height: `${d.height}%` }}>
              <span className="text-[10px] md:text-xs font-mono font-bold text-neutral-600 uppercase text-center">{d.label}</span>
            </div>
          ))}

          {tables.map(t => {
            const occupants = occupancyMap[t.id] || 0;
            const isOccupied = occupants > 0;
            return (
              <div key={t.id} className="absolute w-12 h-12 md:w-16 md:h-16 border-2 rounded-full flex flex-col items-center justify-center shadow-lg"
                   style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)', backgroundColor: isOccupied ? `rgba(245,158,11,${Math.min(occupants * 0.1, 0.8)})` : '#171717', borderColor: isOccupied ? '#f59e0b' : '#333' }}>
                <span className="text-white font-serif font-bold text-sm md:text-lg">{t.table_number}</span>
                <span className="text-[8px] md:text-[10px] font-mono font-bold text-neutral-400">{occupants}/{t.capacity}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}