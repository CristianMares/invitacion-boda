import { neon } from '@neondatabase/serverless';
import { CheckCircle2, AlertCircle, ShieldX, Clock, Users, Utensils } from 'lucide-react';
import VenueMap from '@/components/VenueMap';
import TicketQRToggle from '@/components/TicketQRToggle';

export const dynamic = 'force-dynamic';

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

  try {
    const guestRows = await sql`SELECT * FROM guests WHERE id = ${id}`;
    const guest = guestRows[0];

    if (!guest) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-4 animate-bounce" />
          <h1 className="text-3xl font-serif">Pase Inexistente</h1>
          <p className="text-neutral-500 text-xs font-mono mt-2">El código de acceso no corresponde a ningún invitado registrado.</p>
        </div>
      );
    }

    if (guest.status === 'pending') {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <Clock size={64} className="text-amber-500 mb-6 animate-pulse relative z-10" />
          <h1 className="text-4xl font-serif mb-4 relative z-10">En Revisión</h1>
          <p className="text-neutral-400 text-sm max-w-md relative z-10 font-mono">Los novios están validando tu solicitud de pases.</p>
        </div>
      );
    }

    if (guest.status === 'rejected') {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-serif text-white">Solicitud Declinada</h1>
        </div>
      );
    }

    const companions = await sql`SELECT * FROM companions WHERE guest_id = ${id}`;
    const tables = await sql`SELECT * FROM tables ORDER BY table_number ASC`;
    const decorations = await sql`SELECT * FROM decorations ORDER BY COALESCE(z_index, 10) ASC`;

    const allMembers = [
      { id: guest.id, name: guest.full_name, type: 'Titular', table_id: guest.table_id },
      ...companions.map(c => ({ id: c.id, name: c.full_name, type: 'Acompañante', table_id: c.table_id }))
    ];

    const assignedTableIds = Array.from(new Set(allMembers.map(m => m.table_id).filter(Boolean))) as string[];

    const membersByTableId = allMembers.reduce((acc: any, curr) => {
      const tId = curr.table_id || 'unassigned';
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(curr);
      return acc;
    }, {});

    const memberAssignments = allMembers
      .filter(m => m.table_id)
      .map(m => ({
        name: m.name,
        tableName: tables.find(t => t.id === m.table_id)?.table_number?.toString() || '?'
      }));

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-10 selection:bg-amber-500 selection:text-black">
        
        {/* BOLETO DIGITAL CONTENEDOR TIPO PASS */}
        <div className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          
          {/* ENCABEZADO BOLETO VIP */}
          <header className="p-8 text-center bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-white/5 relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
            <CheckCircle2 size={44} className="text-emerald-400 mx-auto mb-3" />
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.3em] font-bold">Pase Oficial de Acceso</span>
            <h1 className="text-3xl md:text-5xl font-serif text-white mt-1">{guest.full_name}</h1>
            
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
              {guest.has_entered ? '✓ Confirmado en Salón' : 'Acceso Confirmado'}
            </div>
          </header>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* CÓDIGO QR */}
            <div className="bg-black/60 p-6 rounded-3xl border border-white/5 text-center">
              <TicketQRToggle guestId={guest.id} hasEntered={guest.has_entered} />
            </div>

            {/* ASIGNACIÓN DE ASIENTOS Y MESAS */}
            {assignedTableIds.length > 0 && (
              <div className="bg-neutral-900/50 p-6 rounded-3xl border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Utensils size={18} className="text-amber-500" />
                  <h3 className="text-sm font-mono text-amber-400 uppercase font-bold tracking-wider">Ubicación de Asientos</h3>
                </div>

                <div className="grid gap-3">
                  {Object.keys(membersByTableId).map(tId => {
                    if (tId === 'unassigned') return null;
                    const tableName = tables.find(t => t.id === tId)?.table_number;
                    return (
                      <div key={tId} className="bg-black p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">MESA {tableName}</span>
                        </div>
                        <ul className="divide-y divide-white/5 pt-1">
                          {membersByTableId[tId].map((m: any) => (
                            <li key={m.id} className="py-2 text-xs md:text-sm text-neutral-200 flex justify-between items-center">
                              <span className="font-medium">{m.name}</span>
                              <span className="text-[9px] font-mono text-neutral-500 uppercase">{m.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MAPA INTERACTIVO */}
            {assignedTableIds.length > 0 && (
              <VenueMap 
                assignedTableIds={assignedTableIds} 
                tables={tables as any} 
                decorations={decorations as any} 
                memberAssignments={memberAssignments} 
              />
            )}

          </div>

        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-white bg-black min-h-screen flex items-center justify-center font-mono">Error al cargar boleto digital.</div>;
  }
}