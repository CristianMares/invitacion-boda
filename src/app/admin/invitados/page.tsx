import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Check, X, Phone, Users, Clock, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

interface GuestRow {
  id: string;
  full_name: string;
  phone: string;
  tickets_requested: number;
  status: string;
  created_at: string;
  companion_name: string | null;
  companion_desc: string | null;
}

export default async function AdminInvitados({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'pending' } = await searchParams;
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  const rows = await sql`
    SELECT 
      g.id, g.full_name, g.phone, g.tickets_requested, g.status, g.created_at,
      c.full_name as companion_name, c.description as companion_desc
    FROM guests g
    LEFT JOIN companions c ON g.id = c.guest_id
    ORDER BY g.created_at DESC
  ` as GuestRow[];

  const guestsMap = new Map<string, any>();
  
  rows.forEach(row => {
    if (!guestsMap.has(row.id)) {
      guestsMap.set(row.id, {
        id: row.id,
        full_name: row.full_name,
        phone: row.phone,
        tickets_requested: row.tickets_requested,
        status: row.status,
        created_at: row.created_at,
        companions: []
      });
    }
    if (row.companion_name) {
      guestsMap.get(row.id).companions.push({
        name: row.companion_name,
        desc: row.companion_desc
      });
    }
  });

  const invitados = Array.from(guestsMap.values());

  // Contadores críticos para la interfaz de pestañas
  const counts = {
    pending: invitados.filter(g => g.status === 'pending').length,
    approved: invitados.filter(g => g.status === 'approved').length,
    rejected: invitados.filter(g => g.status === 'rejected').length,
  };

  // Filtrado de la lista actual
  const filteredGuests = invitados.filter(g => g.status === tab);

  async function updateStatus(id: string, newStatus: string) {
    'use server';
    const db = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await db`UPDATE guests SET status = ${newStatus} WHERE id = ${id}`;
    revalidatePath('/admin/invitados');
  }

  return (
    <div className="h-full bg-black text-white p-4 md:p-10 font-sans overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-5xl mx-auto pb-24">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 pt-12 md:pt-0">
          <div>
            <h1 className="text-4xl font-serif text-white tracking-wide">Validación de Registros</h1>
            <p className="text-neutral-500 text-sm mt-1 font-mono">Fase 1: Control de admisión relacional</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 hidden sm:flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Control Panel</span>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
        <div className="flex border-b border-white/5 mb-8 gap-2 overflow-x-auto">
          <Link href="/admin/invitados?tab=pending" className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${tab === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-transparent text-neutral-500 border-transparent'}`}>
            Pendientes ({counts.pending})
          </Link>
          <Link href="/admin/invitados?tab=approved" className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${tab === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-neutral-500 border-transparent'}`}>
            Aprobados ({counts.approved})
          </Link>
          <Link href="/admin/invitados?tab=rejected" className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${tab === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-transparent text-neutral-500 border-transparent'}`}>
            Rechazados ({counts.rejected})
          </Link>
        </div>

        {/* CONTENEDOR DE TARJETAS */}
        <div className="grid gap-4">
          {filteredGuests.length === 0 && (
            <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="text-neutral-700" size={32} />
              <p className="text-neutral-500 text-xs font-mono">No hay registros en esta sección.</p>
            </div>
          )}

          {filteredGuests.map((guest) => (
            <div key={guest.id} className="bg-neutral-900/30 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md hover:border-white/10 transition-colors">
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-serif text-white">{guest.full_name}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-neutral-400 font-mono">
                  <div className="flex items-center gap-1.5"><Phone size={12} className="text-neutral-600" /> {guest.phone}</div>
                  <div className="flex items-center gap-1.5"><Users size={12} className="text-neutral-600" /> {guest.tickets_requested} pases</div>
                  <div className="flex items-center gap-1.5"><Clock size={12} className="text-neutral-600" /> {new Date(guest.created_at).toLocaleDateString()}</div>
                </div>

                {guest.companions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {guest.companions.map((c: any, i: number) => (
                      <span key={i} className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 text-neutral-400" title={c.desc}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* BOTONES CON LÓGICA DE ESTADO EXCLUSIVA */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {tab === 'pending' && (
                  <>
                    <form action={updateStatus.bind(null, guest.id, 'rejected')}>
                      <button type="submit" className="p-3 bg-neutral-900 hover:bg-red-950/30 text-neutral-500 hover:text-red-400 rounded-xl transition-all border border-white/5">
                        <X size={16} />
                      </button>
                    </form>
                    <form action={updateStatus.bind(null, guest.id, 'approved')}>
                      <button type="submit" className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
                        <Check size={16} /> Aprobar
                      </button>
                    </form>
                  </>
                )}

                {tab === 'approved' && (
                  <form action={updateStatus.bind(null, guest.id, 'rejected')}>
                    <button type="submit" className="flex items-center gap-2 bg-neutral-900 border border-red-500/20 hover:bg-red-950/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                      <X size={14} /> Revocar y Rechazar
                    </button>
                  </form>
                )}

                {tab === 'rejected' && (
                  <form action={updateStatus.bind(null, guest.id, 'approved')}>
                    <button type="submit" className="flex items-center gap-2 bg-neutral-900 border border-emerald-500/20 hover:bg-emerald-950/40 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                      <Check size={14} /> Re-Aprobar Acceso
                    </button>
                  </form>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}